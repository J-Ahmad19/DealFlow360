import { db } from '../src/db/client.js';
import * as schema from '../src/db/schema/dealflow.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import argon2 from 'argon2';

async function main() {
  console.log('🌱 Starting DealFlow360 Database Seed...');
  
  const passwordHash = await argon2.hash('28$Nov$2004');

  await db.transaction(async (tx) => {
    console.log('📦 Provisioning Users...');
    const seedUsers = [
      { email: 'admin@dealflow360.dev', fullName: 'System Admin', role: 'admin' as const },
      { email: 'manager@dealflow360.dev', fullName: 'Sales Manager', role: 'sales_manager' as const },
      { email: 'finance@dealflow360.dev', fullName: 'Finance Director', role: 'finance' as const },
      { email: 'rep@dealflow360.dev', fullName: 'Sales Representative', role: 'sales_rep' as const },
    ];

    const userMap = new Map();
    for (const su of seedUsers) {
      let [u] = await tx.select().from(schema.users).where(eq(schema.users.email, su.email));
      if (!u) {
        [u] = await tx.insert(schema.users).values({ ...su, passwordHash }).returning();
      } else {
        // Ensure password matches just in case
        [u] = await tx.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, u.id)).returning();
      }
      userMap.set(su.role, u);
    }
    const adminUser = userMap.get('admin');
    const managerUser = userMap.get('sales_manager');
    const financeUser = userMap.get('finance');
    const repUser = userMap.get('sales_rep');

    console.log('📦 Provisioning Customer Tiers...');
    async function getOrCreateTier(name: string) {
      let [tier] = await tx.select().from(schema.customerTiers).where(eq(schema.customerTiers.name, name));
      if (!tier) [tier] = await tx.insert(schema.customerTiers).values({ name }).returning();
      return tier;
    }
    const bronzeTier = await getOrCreateTier('BRONZE');
    const silverTier = await getOrCreateTier('SILVER');
    const goldTier = await getOrCreateTier('GOLD');

    console.log('📦 Provisioning Customers...');
    let [acme] = await tx.select().from(schema.companies).where(eq(schema.companies.name, 'Acme Corporation'));
    if (!acme) {
      [acme] = await tx.insert(schema.companies).values({ name: 'Acme Corporation', tierId: goldTier.id, domain: 'acmecorp.com' }).returning();
    }
    let [acmeContact] = await tx.select().from(schema.contacts).where(eq(schema.contacts.email, 'contact@acmecorp.com'));
    if (!acmeContact) {
      [acmeContact] = await tx.insert(schema.contacts).values({ companyId: acme.id, firstName: 'John', lastName: 'Doe', email: 'contact@acmecorp.com' }).returning();
    }

    console.log('📦 Provisioning Categories...');
    async function getOrCreateCategory(name: string) {
      let [cat] = await tx.select().from(schema.productCategories).where(eq(schema.productCategories.name, name));
      if (!cat) [cat] = await tx.insert(schema.productCategories).values({ name }).returning();
      return cat;
    }
    const hwCat = await getOrCreateCategory('Hardware');
    const svcCat = await getOrCreateCategory('Services');
    const subCat = await getOrCreateCategory('Subscriptions');

    console.log('📦 Provisioning Products...');
    async function getOrCreateProduct(p: any) {
      let [prod] = await tx.select().from(schema.products).where(eq(schema.products.name, p.name));
      if (!prod) [prod] = await tx.insert(schema.products).values(p).returning();
      return prod;
    }
    const laptop = await getOrCreateProduct({ name: 'Enterprise Laptop', categoryId: hwCat.id, isRecurring: false, price: 150000, cost: 100000 });
    const setup = await getOrCreateProduct({ name: 'Setup Service', categoryId: svcCat.id, isRecurring: false, price: 50000, cost: 20000 });
    const warranty = await getOrCreateProduct({ name: 'Extended Warranty', categoryId: svcCat.id, isRecurring: false, price: 30000, cost: 10000 });
    const support = await getOrCreateProduct({ name: 'Premium Support', categoryId: subCat.id, isRecurring: true, billingInterval: 'monthly' as const, price: 10000, cost: 5000 });

    console.log('📦 Provisioning Upsell Rules...');
    let [upsell] = await tx.select().from(schema.upsells).where(and(eq(schema.upsells.sourceProductId, laptop.id), eq(schema.upsells.targetProductId, warranty.id)));
    if (!upsell) {
      await tx.insert(schema.upsells).values({ sourceProductId: laptop.id, targetProductId: warranty.id });
    }

    console.log('📦 Provisioning Price Lists...');
    let [standardPl] = await tx.select().from(schema.priceLists).where(eq(schema.priceLists.name, 'Standard 2026'));
    if (!standardPl) {
      [standardPl] = await tx.insert(schema.priceLists).values({ name: 'Standard 2026', active: true }).returning();
      // Link items
      await tx.insert(schema.priceListItems).values([
        { priceListId: standardPl.id, productId: laptop.id, price: 150000 },
        { priceListId: standardPl.id, productId: setup.id, price: 50000 },
        { priceListId: standardPl.id, productId: warranty.id, price: 30000 },
        { priceListId: standardPl.id, productId: support.id, price: 10000 },
      ]);
    }

    console.log('📦 Provisioning Discount Policies...');
    async function upsertDiscountPolicy(tierId: string, categoryId: string, discountPercent: number) {
      let [pol] = await tx.select().from(schema.discountPolicies).where(and(eq(schema.discountPolicies.tierId, tierId), eq(schema.discountPolicies.categoryId, categoryId)));
      if (!pol) await tx.insert(schema.discountPolicies).values({ tierId, categoryId, discountPercent });
      else await tx.update(schema.discountPolicies).set({ discountPercent }).where(eq(schema.discountPolicies.id, pol.id));
    }
    await upsertDiscountPolicy(goldTier.id, hwCat.id, 15);
    await upsertDiscountPolicy(goldTier.id, svcCat.id, 10);
    await upsertDiscountPolicy(goldTier.id, subCat.id, 10);

    console.log('📦 Provisioning Approval Rules...');
    const rulesData = [
      { minRisk: 0, maxRisk: 20, approverRole: 'sales_rep' as const, sequence: 0 }, // Auto (self-approve placeholder)
      { minRisk: 21, maxRisk: 50, approverRole: 'sales_manager' as const, sequence: 1 },
      { minRisk: 51, maxRisk: 100, approverRole: 'finance' as const, sequence: 2 },
    ];
    let existingRules = await tx.select().from(schema.approvalRules);
    if (existingRules.length === 0) {
      await tx.insert(schema.approvalRules).values(rulesData);
    }

    console.log('📦 Provisioning Warehouses & Inventory...');
    async function getOrCreateWarehouse(name: string, location: string) {
      let [w] = await tx.select().from(schema.warehouses).where(eq(schema.warehouses.name, name));
      if (!w) [w] = await tx.insert(schema.warehouses).values({ name, location, baseShippingCost: 5000 }).returning();
      return w;
    }
    const mainWh = await getOrCreateWarehouse('Main Warehouse', 'New York, NY');
    const eastWh = await getOrCreateWarehouse('East Depot', 'Boston, MA');

    async function setInventory(productId: string, warehouseId: string, availableQty: number) {
      let [inv] = await tx.select().from(schema.inventory).where(and(eq(schema.inventory.productId, productId), eq(schema.inventory.warehouseId, warehouseId)));
      if (!inv) await tx.insert(schema.inventory).values({ productId, warehouseId, availableQty, reservedQty: 0 });
      else await tx.update(schema.inventory).set({ availableQty }).where(eq(schema.inventory.id, inv.id));
    }
    await setInventory(laptop.id, mainWh.id, 60);
    await setInventory(laptop.id, eastWh.id, 40);

    console.log('📦 Provisioning Scenarios (Quotations & Downstream)...');
    
    // Scenario A: Normal Quote (Auto Approved / Draft)
    let [quoteA] = await tx.select().from(schema.quotations).where(eq(schema.quotations.title, 'Demo: Normal Quote'));
    if (!quoteA) {
      [quoteA] = await tx.insert(schema.quotations).values({
        title: 'Demo: Normal Quote', amount: 150000, status: 'draft', customerId: acme.id, ownerId: repUser.id,
        subtotal: 150000, discount: 0, tax: 0, margin: 50000, riskScore: 10
      }).returning();
      await tx.insert(schema.quotationLines).values([
        { quotationId: quoteA.id, productId: laptop.id, productNameSnapshot: laptop.name, unitPrice: 150000, quantity: 1, taxRate: 0, discount: 0, subtotal: 150000, total: 150000 }
      ]);
    }

    // Scenario B: High Discount (Pending Approval)
    let [quoteB] = await tx.select().from(schema.quotations).where(eq(schema.quotations.title, 'Demo: High Discount Pending'));
    if (!quoteB) {
      [quoteB] = await tx.insert(schema.quotations).values({
        title: 'Demo: High Discount Pending', amount: 105000, status: 'pending_approval', customerId: acme.id, ownerId: repUser.id,
        subtotal: 150000, discount: 45000, tax: 0, margin: 5000, riskScore: 75
      }).returning();
      await tx.insert(schema.quotationLines).values([
        { quotationId: quoteB.id, productId: laptop.id, productNameSnapshot: laptop.name, unitPrice: 150000, quantity: 1, taxRate: 0, discount: 30, subtotal: 105000, total: 105000 }
      ]);
      // Trigger approvals for manager and finance
      await tx.insert(schema.approvals).values([
        { quotationId: quoteB.id, approverRole: 'sales_manager', status: 'approved', riskScore: 75, sequence: 1 },
        { quotationId: quoteB.id, approverRole: 'finance', status: 'pending', riskScore: 75, sequence: 2 },
      ]);
    }

    // Scenario C: Approved Quote / Fulfillment / Sub Billing (Multi-warehouse)
    let [quoteC] = await tx.select().from(schema.quotations).where(eq(schema.quotations.title, 'Demo: Enterprise Deal Won'));
    if (!quoteC) {
      [quoteC] = await tx.insert(schema.quotations).values({
        title: 'Demo: Enterprise Deal Won', amount: 160000, status: 'confirmed', customerId: acme.id, ownerId: repUser.id,
        subtotal: 160000, discount: 0, tax: 0, margin: 55000, riskScore: 15
      }).returning();
      await tx.insert(schema.quotationLines).values([
        { quotationId: quoteC.id, productId: laptop.id, productNameSnapshot: laptop.name, unitPrice: 150000, quantity: 1, taxRate: 0, discount: 0, subtotal: 150000, total: 150000 },
        { quotationId: quoteC.id, productId: support.id, productNameSnapshot: support.name, unitPrice: 10000, quantity: 1, taxRate: 0, discount: 0, subtotal: 10000, total: 10000 }
      ]);
      await tx.insert(schema.quotationAllocations).values([
        { quotationId: quoteC.id, productId: laptop.id, warehouseId: mainWh.id, quantity: 1 }
      ]);
      const [order] = await tx.insert(schema.orders).values({ quotationId: quoteC.id }).returning();
      await tx.insert(schema.orderLines).values([
        { orderId: order.id, lineType: 'PRODUCT', productId: laptop.id, quantity: 1 },
        { orderId: order.id, lineType: 'SUBSCRIPTION', productId: support.id, quantity: 1 }
      ]);
      await tx.insert(schema.fulfillments).values({ quotationId: quoteC.id, status: 'processing' });
      await tx.insert(schema.billingSchedules).values({ orderId: order.id, billingDate: new Date(), status: 'scheduled', amount: 10000, isRecurring: true });
      await tx.insert(schema.subscriptions).values({
        orderId: order.id, productId: support.id, status: 'active', interval: 'monthly',
        currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Scenario E: Negotiation and Deal Health Alerts
    let [quoteE] = await tx.select().from(schema.quotations).where(eq(schema.quotations.title, 'Demo: Under Negotiation'));
    if (!quoteE) {
      [quoteE] = await tx.insert(schema.quotations).values({
        title: 'Demo: Under Negotiation', amount: 300000, status: 'under_negotiation', customerId: acme.id, ownerId: repUser.id,
        subtotal: 300000, discount: 0, tax: 0, margin: 100000, riskScore: 35
      }).returning();
      await tx.insert(schema.quotationLines).values([
        { quotationId: quoteE.id, productId: laptop.id, productNameSnapshot: laptop.name, unitPrice: 150000, quantity: 2, taxRate: 0, discount: 0, subtotal: 300000, total: 300000 }
      ]);
      await tx.insert(schema.negotiationThreads).values({
        quotationId: quoteE.id, message: 'Customer is requesting a 20% discount across the board, which exceeds tier limits.'
      });
      await tx.insert(schema.dealHealthAlerts).values({
        quotationId: quoteE.id, type: 'STALLED', severity: 'medium', score: -15, reason: 'Deal has been under negotiation for >14 days', unresolved: true
      });
    }

  });
  console.log('✅ Database Seed Complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Database Seed Failed:', err);
  process.exit(1);
});
