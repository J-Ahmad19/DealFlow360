// ─── Entity Types ──────────────────────────────────────────────────────────────

export type EntityType =
  | 'quotation'
  | 'deal'
  | 'product'
  | 'company'
  | 'contact'
  | 'user'
  | 'subscription'
  | 'payment'
  | 'order'
  | 'warehouse';

// ─── Audit Action Constants ────────────────────────────────────────────────────
// Namespaced as entity.verb for easy filtering and consistency.

export const AuditAction = {
  // Auth
  USER_SIGNUP:           'user.signup',
  USER_LOGIN:            'user.login',
  USER_LOGOUT:           'user.logout',
  USER_ROLE_CHANGED:     'user.role_changed',
  USER_STATUS_CHANGED:   'user.status_changed',

  // Quotations
  QUOTATION_CREATED:           'quotation.created',
  QUOTATION_UPDATED:           'quotation.updated',
  QUOTATION_SUBMITTED:         'quotation.submitted',
  QUOTATION_STATUS_CHANGED:    'quotation.status_changed',
  QUOTATION_REVISION_REQUIRED: 'quotation.revision_required',

  // Approvals
  APPROVAL_APPROVED:           'approval.approved',
  APPROVAL_REJECTED:           'approval.rejected',
  APPROVAL_REVISION_REQUESTED: 'approval.revision_requested',

  // Discounts
  DISCOUNT_CHANGED: 'quotation.discount_changed',

  // Portal / Customer negotiation
  PORTAL_MESSAGE_ADDED:       'portal.message_added',
  PORTAL_COUNTER_OFFER:       'portal.counter_offer',
  PORTAL_QUOTATION_CONFIRMED: 'portal.quotation_confirmed',

  // Orders & Billing
  ORDER_CREATED:              'order.created',
  PAYMENT_PROCESSED:          'payment.processed',
  PAYMENT_REFUNDED:           'payment.refunded',
  SUBSCRIPTION_MODIFIED:      'subscription.modified',
  SUBSCRIPTION_CANCELLED:     'subscription.cancelled',

  // Customers
  CUSTOMER_CREATED:           'company.created',
  CUSTOMER_UPDATED:           'company.updated',
  CUSTOMER_STATUS_CHANGED:    'company.status_changed',

  // Products
  PRODUCT_CREATED:            'product.created',
  PRODUCT_UPDATED:            'product.updated',
  PRODUCT_DISCOUNT_CHANGED:   'product.discount_changed',

  // Warehouse / Inventory
  WAREHOUSE_OVERRIDE:         'warehouse.override',
  INVENTORY_RESERVED:         'warehouse.inventory_reserved',

  // Deal Health
  DEAL_HEALTH_ESCALATED:      'deal.health_alert_escalated',
} as const;

export type AuditActionType = typeof AuditAction[keyof typeof AuditAction];
