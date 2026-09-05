import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
  check,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['admin', 'sales_manager', 'finance', 'sales_rep']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const quotationStatusEnum = pgEnum('quotation_status', [
  'draft', 
  'pending_approval', 
  'approved', 
  'rejected', 
  'revision_required', 
  'fulfillment', 
  'confirmed', 
  'under_negotiation'
]);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const backorderStatusEnum = pgEnum('backorder_status', ['pending', 'fulfilled', 'cancelled']);
export const billingStatusEnum = pgEnum('billing_status', ['scheduled', 'invoiced', 'paid', 'failed']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const healthAlertTypeEnum = pgEnum('health_alert_type', [
  'STALLED',
  'DISCOUNT_ANOMALY',
  'DELIVERY_SLIPPAGE',
  'APPROVAL_BOTTLENECK',
  'EXCESSIVE_NEGOTIATION',
]);
export const entityTypeEnum = pgEnum('entity_type', [
  'quotation', 'deal', 'product', 'company', 'contact',
  'user', 'subscription', 'payment', 'order', 'warehouse',
]);
export const billingIntervalEnum = pgEnum('billing_interval', ['monthly', 'quarterly', 'yearly']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled']);
export const paymentTypeEnum = pgEnum('payment_type', ['charge', 'refund']);
export const fulfillmentStatusEnum = pgEnum('fulfillment_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

// ─── Core Tables ──────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: userRoleEnum('role').default('sales_rep').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
  ]
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('refresh_tokens_user_idx').on(table.userId),
  ]
);

export const portalTokens = pgTable(
  'portal_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('portal_tokens_contact_idx').on(table.contactId),
  ]
);

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }),
    tierId: uuid('tier_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('companies_name_idx').on(table.name),
  ]
);

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('contacts_company_id_idx').on(table.companyId),
    uniqueIndex('contacts_email_idx').on(table.email),
  ]
);

// ─── Products, Pricing & Inventory ─────────────────────────────────────────────

export const customerTiers = pgTable('customer_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const priceLists = pgTable('price_lists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const priceListItems = pgTable(
  'price_list_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    priceListId: uuid('price_list_id').references(() => priceLists.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    price: integer('price').notNull(),
  },
  (table) => [
    uniqueIndex('price_list_items_list_product_idx').on(table.priceListId, table.productId),
  ]
);

export const productCategories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    categoryId: uuid('category_id').references(() => productCategories.id),
    active: boolean('active').default(true).notNull(),
    promoted: boolean('promoted').default(false).notNull(),
    isRecurring: boolean('is_recurring').default(false).notNull(),
    billingInterval: billingIntervalEnum('billing_interval'),
    price: integer('price').notNull().default(0),
    cost: integer('cost').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 3. Product picker: category_id + active (Partial index for active products)
    index('products_category_active_idx').on(table.categoryId).where(sql`${table.active} = true`),
  ]
);

export const discountPolicies = pgTable(
  'discount_policies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tierId: uuid('tier_id').references(() => customerTiers.id).notNull(),
    categoryId: uuid('category_id').references(() => productCategories.id),
    discountPercent: integer('discount_percent').notNull(),
  },
  (table) => [
    // 4. Discount policy lookup: tier_id / category_id
    index('discount_policies_tier_category_idx').on(table.tierId, table.categoryId),
  ]
);

export const upsells = pgTable(
  'upsells',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceProductId: uuid('source_product_id').references(() => products.id).notNull(),
    targetProductId: uuid('target_product_id').references(() => products.id).notNull(),
  },
  (table) => [
    // 5. Upsell lookup: source_product_id
    index('upsells_source_product_idx').on(table.sourceProductId),
  ]
);

export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  baseShippingCost: integer('base_shipping_cost').notNull().default(0),
});

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
    availableQty: integer('available_qty').notNull().default(0),
    reservedQty: integer('reserved_qty').notNull().default(0),
  },
  (table) => [
    // 9. Warehouse split: product_id + available_qty DESC
    index('inventory_product_qty_desc_idx').on(table.productId, table.availableQty.desc()),
    uniqueIndex('inventory_product_warehouse_uidx').on(table.productId, table.warehouseId),
  ]
);

// ─── Quotations & Pipeline ───────────────────────────────────────────────────

export const quotations = pgTable(
  'quotations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    amount: integer('amount').notNull().default(0),
    status: quotationStatusEnum('status').default('draft').notNull(),
    customerId: uuid('customer_id').references(() => companies.id),
    ownerId: uuid('owner_id').references(() => users.id),
    subtotal: integer('subtotal').notNull().default(0),
    tax: integer('tax').notNull().default(0),
    discount: integer('discount').notNull().default(0),
    margin: integer('margin').notNull().default(0),
    riskScore: integer('risk_score').notNull().default(0),
    lastActivityAt: timestamp('last_activity_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // 1. Rep quotation list: owner_id + status
    index('quotations_owner_status_idx').on(table.ownerId, table.status),
    
    // 2. Pipeline: status + created_at DESC
    index('quotations_status_created_desc_idx').on(table.status, table.createdAt.desc()),
    
    // 15. Customer quotation history: customer_id + created_at DESC
    index('quotations_customer_created_desc_idx').on(table.customerId, table.createdAt.desc()),
    
    // 18. Stalled deal scan: open quotation + last_activity_at (Partial index for open/negotiating states)
    index('quotations_stalled_scan_idx')
      .on(table.lastActivityAt)
      .where(sql`${table.status} IN ('draft', 'under_negotiation')`),
      
    // 20. Reporting: created_at + owner_id + status
    index('quotations_reporting_idx').on(table.createdAt, table.ownerId, table.status),
  ]
);

export const quotationLines = pgTable(
  'quotation_lines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    productNameSnapshot: varchar('product_name_snapshot', { length: 255 }).notNull(),
    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull().default(1),
    taxRate: integer('tax_rate').notNull().default(0),
    discount: integer('discount').notNull().default(0),
    subtotal: integer('subtotal').notNull(),
    total: integer('total').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('quotation_lines_quotation_idx').on(table.quotationId),
  ]
);

export const quotationAllocations = pgTable(
  'quotation_allocations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
    quantity: integer('quantity').notNull().default(0),
    isOverride: boolean('is_override').notNull().default(false),
  },
  (table) => [
    index('quotation_allocations_quotation_idx').on(table.quotationId),
    uniqueIndex('quotation_allocations_q_p_w_uidx').on(table.quotationId, table.productId, table.warehouseId),
  ]
);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  quotationId: uuid('quotation_id').references(() => quotations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderLines = pgTable(
  'order_lines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    lineType: varchar('line_type', { length: 50 }).notNull(),
    productId: uuid('product_id').references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
  },
  (table) => [
    // 13. Order lines: order_id + line_type
    index('order_lines_order_type_idx').on(table.orderId, table.lineType),
  ]
);

// ─── Approvals ───────────────────────────────────────────────────────────────

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
    approverRole: userRoleEnum('approver_role').notNull(),
    status: approvalStatusEnum('status').default('pending').notNull(),
    riskScore: integer('risk_score').default(0),
    sequence: integer('sequence').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 6. Approval queue: pending approval + risk_score DESC (Partial index for pending)
    index('approvals_queue_idx')
      .on(table.riskScore.desc())
      .where(sql`${table.status} = 'pending'`),
      
    // 7. Manager/Finance pending approvals: approver_role + status
    index('approvals_role_status_idx').on(table.approverRole, table.status),
    
    // 8. Approval detail: quotation_id + sequence (Unique constraint handles index + uniqueness)
    uniqueIndex('approvals_quotation_sequence_uidx').on(table.quotationId, table.sequence),
  ]
);

export const approvalRules = pgTable('approval_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  minRisk: integer('min_risk').notNull().default(0),
  maxRisk: integer('max_risk').notNull(),
  approverRole: userRoleEnum('approver_role').notNull(),
  sequence: integer('sequence').notNull(),
});

// ─── Fulfillment & Billing ────────────────────────────────────────────────────

export const fulfillments = pgTable(
  'fulfillments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
    status: fulfillmentStatusEnum('status').default('pending').notNull(),
    estimatedDelivery: timestamp('estimated_delivery'),
    shippedAt: timestamp('shipped_at'),
  },
  (table) => [
    // 10. Fulfillment: quotation_id
    index('fulfillments_quotation_idx').on(table.quotationId),
  ]
);

export const backorders = pgTable(
  'backorders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderLineId: uuid('order_line_id').references(() => orderLines.id).notNull(),
    status: backorderStatusEnum('status').default('pending').notNull(),
  },
  (table) => [
    // 11. Open backorders: status = PENDING (Partial index)
    index('backorders_open_idx')
      .on(table.status)
      .where(sql`${table.status} = 'pending'`),
  ]
);

export const billingSchedules = pgTable(
  'billing_schedules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    billingDate: timestamp('billing_date').notNull(),
    status: billingStatusEnum('status').default('scheduled').notNull(),
    amount: integer('amount').notNull().default(0),
    isRecurring: boolean('is_recurring').notNull().default(false),
  },
  (table) => [
    // 12. Billing worker: status = SCHEDULED + billing_date <= current date
    // We index status + billingDate. We can use partial index for scheduled status.
    index('billing_worker_idx')
      .on(table.billingDate)
      .where(sql`${table.status} = 'scheduled'`),
  ]
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    status: subscriptionStatusEnum('status').default('active').notNull(),
    interval: billingIntervalEnum('interval').notNull(),
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('subscriptions_order_idx').on(table.orderId),
    index('subscriptions_status_idx').on(table.status),
  ]
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    amount: integer('amount').notNull(),
    type: paymentTypeEnum('type').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('payments_order_idx').on(table.orderId),
  ]
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    billingId: uuid('billing_id').references(() => billingSchedules.id),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    dueAt: timestamp('due_at').notNull(),
  },
  (table) => [
    // 14. Invoice list: status + due_at
    index('invoices_status_due_idx').on(table.status, table.dueAt),
  ]
);

// ─── Threads & Deal Health ────────────────────────────────────────────────────

export const negotiationThreads = pgTable(
  'negotiation_threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 16. Negotiation thread: quotation_id + created_at DESC
    index('negotiation_threads_quotation_created_desc_idx').on(table.quotationId, table.createdAt.desc()),
  ]
);

export const dealHealthAlerts = pgTable(
  'deal_health_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quotationId: uuid('quotation_id').references(() => quotations.id).notNull(),
    type: healthAlertTypeEnum('type').notNull(),
    severity: severityEnum('severity').notNull(),
    score: integer('score').notNull().default(0),
    reason: text('reason').notNull(),
    unresolved: boolean('unresolved').default(true).notNull(),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 17. Deal health open alerts: unresolved + severity + created_at DESC (Partial index for unresolved)
    index('deal_health_open_alerts_idx')
      .on(table.severity, table.createdAt.desc())
      .where(sql`${table.unresolved} = true`),
      
    // 19. Health alert -> quotation: quotation_id
    index('deal_health_quotation_idx').on(table.quotationId),
  ]
);

// ─── Auditing ─────────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: entityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    actorId: uuid('actor_id').references(() => users.id).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    reason: text('reason'),
    beforeJson: jsonb('before_json'),
    afterJson: jsonb('after_json'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 512 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 21. Audit entity: entity_type + entity_id + created_at DESC
    index('audit_entity_idx').on(table.entityType, table.entityId, table.createdAt.desc()),
    
    // 22. Audit actor: actor_id + created_at DESC
    index('audit_actor_idx').on(table.actorId, table.createdAt.desc()),
  ]
);
