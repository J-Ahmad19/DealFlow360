import { randomUUID } from 'node:crypto';
import { db } from '../src/db/client.js';
import { 
  products, quotations, quotationLines, companies, 
  orders, billingSchedules, subscriptions, payments, invoices 
} from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { BillingEngine } from '../src/modules/billing/billing.engine.js';
import { SubscriptionService } from '../src/modules/billing/subscription.service.js';
import { OrderService } from '../src/modules/billing/order.service.js';
import { BillingService } from '../src/modules/billing/billing.service.js';

describe('Order & Hybrid Billing System', () => {
  let customerId: string;
  let oneTimeProductId: string;
  let recurringProductId: string;
  let quotationId: string;
  let orderId: string;

  const billingEngine = new BillingEngine();
  const subscriptionService = new SubscriptionService(billingEngine);
  const orderService = new OrderService(billingEngine, subscriptionService);

  beforeAll(async () => {
    customerId = randomUUID();
    await db.insert(companies).values({ id: customerId, name: 'Billing Test Corp' });

    oneTimeProductId = randomUUID();
    await db.insert(products).values({ 
      id: oneTimeProductId, name: 'Setup Service', price: 5000, isRecurring: false 
    });

    recurringProductId = randomUUID();
    await db.insert(products).values({ 
      id: recurringProductId, name: 'Premium Support', price: 1000, isRecurring: true, billingInterval: 'monthly' 
    });

    quotationId = randomUUID();
    await db.insert(quotations).values({ id: quotationId, title: 'Hybrid Quote', customerId, status: 'approved' });
    
    // 1x Setup Service, 2x Premium Support
    await db.insert(quotationLines).values([
      { quotationId, productId: oneTimeProductId, productNameSnapshot: 'Setup', unitPrice: 5000, quantity: 1, subtotal: 5000, total: 5000 },
      { quotationId, productId: recurringProductId, productNameSnapshot: 'Support', unitPrice: 1000, quantity: 2, subtotal: 2000, total: 2000 }
    ]);
  });

  afterAll(async () => {
    // Cleanup
    if (orderId) {
      const bSchedules = await db.select().from(billingSchedules).where(eq(billingSchedules.orderId, orderId));
      for (const bs of bSchedules) {
        await db.delete(invoices).where(eq(invoices.billingId, bs.id));
      }
      await db.delete(billingSchedules).where(eq(billingSchedules.orderId, orderId));
      await db.delete(subscriptions).where(eq(subscriptions.orderId, orderId));
      await db.delete(payments).where(eq(payments.orderId, orderId));
      await db.delete(orders).where(eq(orders.id, orderId));
    }
    await db.delete(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    await db.delete(quotations).where(eq(quotations.id, quotationId));
    await db.delete(products).where(eq(products.id, oneTimeProductId));
    await db.delete(products).where(eq(products.id, recurringProductId));
    await db.delete(companies).where(eq(companies.id, customerId));
  });

  it('OrderService: should create an order, hybrid billing schedules, and subscriptions', async () => {
    const order = await orderService.createOrderFromQuotation(quotationId);
    orderId = order.id;

    // Verify Schedules (one for one-time, one for recurring)
    const schedules = await db.select().from(billingSchedules).where(eq(billingSchedules.orderId, orderId));
    expect(schedules.length).toBe(2);

    const oneTimeSchedule = schedules.find(s => !s.isRecurring);
    expect(oneTimeSchedule?.amount).toBe(5000);

    const recurringSchedule = schedules.find(s => s.isRecurring);
    expect(recurringSchedule?.amount).toBe(2000); // 2x1000

    // Verify Invoices
    const invs = await db.select().from(invoices);
    const orderInvoices = invs.filter(i => schedules.some(s => s.id === i.billingId));
    expect(orderInvoices.length).toBe(2);

    // Verify Subscriptions
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.orderId, orderId));
    expect(subs.length).toBe(1); // 1 recurring line in quotation (qty 2)
    expect(subs[0].interval).toBe('monthly');
    expect(subs[0].status).toBe('active');
  });

  it('BillingEngine: should process payments idempotently', async () => {
    const idempotencyKey = randomUUID();
    
    // First payment attempt
    const payment1 = await billingEngine.processPayment(orderId, 5000, idempotencyKey);
    expect(payment1.amount).toBe(5000);

    // Second payment attempt with same key
    const payment2 = await billingEngine.processPayment(orderId, 5000, idempotencyKey);
    expect(payment2.id).toBe(payment1.id); // Should return the exact same record

    // Verify only one payment exists
    const pays = await db.select().from(payments).where(eq(payments.orderId, orderId));
    expect(pays.length).toBe(1);
  });

  it('SubscriptionService: should modify the billing cycle and update the renewal window', async () => {
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.orderId, orderId));
    const sub = subs[0];

    const modified = await subscriptionService.modifySubscription(sub.id, randomUUID(), 'quarterly');
    expect(modified.interval).toBe('quarterly');
    expect(modified.status).toBe('active');
    expect(new Date(modified.currentPeriodEnd).getTime()).toBeGreaterThan(new Date(sub.currentPeriodEnd).getTime());
  });

  it('SubscriptionService: should calculate proration correctly on cancellation', async () => {
    const subs = await db.select().from(subscriptions).where(eq(subscriptions.orderId, orderId));
    const sub = subs[0];

    const refundKey = randomUUID();
    
    // We can't easily mock `new Date()` internally without a library, but since it cancels *now*,
    // and the subscription just started (so almost 100% of the period is unused).
    const canceledSub = await subscriptionService.cancelSubscription(sub.id, refundKey);
    expect(canceledSub.status).toBe('canceled');

    const pays = await db.select().from(payments).where(eq(payments.orderId, orderId));
    const refunds = pays.filter(p => p.type === 'refund');
    
    // Since we just started a monthly subscription today, refund should be close to 100% (value 1000 for simulation).
    expect(refunds.length).toBe(1);
    expect(refunds[0].amount).toBeGreaterThan(900); // Usually 900-1000 depending on exact ms elapsed
  });

  it('BillingService: should list invoice summaries with customer and order metadata', async () => {
    const overview = await BillingService.getInvoiceOverview();

    expect(overview.summary.totalInvoices).toBeGreaterThan(0);
    expect(overview.invoices.length).toBeGreaterThan(0);
    expect(overview.invoices[0]).toMatchObject({
      customerName: expect.any(String),
      amount: expect.any(Number),
    });
  });
});
