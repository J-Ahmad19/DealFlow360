import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { db } from '../src/db/client.js';
import {
  billingSchedules,
  invoices,
  quotations,
  dealHealthAlerts,
  notifications,
  orders,
  companies,
  users,
} from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import {
  processBillingJob,
  processDealHealthJob,
  processRecommendationJob,
  processNotificationJob,
  runAllJobs,
} from '../src/jobs/index.js';

describe('Background Jobs Layer', () => {
  let userId: string;
  let companyId: string;
  let orderId: string;

  beforeEach(async () => {
    // Create test user and company
    const [u] = await db
      .insert(users)
      .values({
        email: `job-test-${Date.now()}@example.com`,
        fullName: 'Job Test User',
        role: 'sales_rep',
      })
      .returning();
    userId = u.id;

    const [c] = await db
      .insert(companies)
      .values({
        name: `Job Test Corp ${Date.now()}`,
      })
      .returning();
    companyId = c.id;

    const [o] = await db
      .insert(orders)
      .values({})
      .returning();
    orderId = o.id;
  });

  it('1. processBillingJob is idempotent and processes due billing schedules', async () => {
    // Create a due billing schedule (billingDate in past)
    const dueDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [schedule] = await db
      .insert(billingSchedules)
      .values({
        orderId,
        billingDate: dueDate,
        status: 'scheduled',
        amount: 50000,
        isRecurring: true,
      })
      .returning();

    // Run billing worker first time
    const res1 = await processBillingJob();
    expect(res1.processed).toBeGreaterThanOrEqual(1);

    // Verify billing schedule status updated to 'invoiced'
    const [updatedSchedule] = await db
      .select()
      .from(billingSchedules)
      .where(eq(billingSchedules.id, schedule.id));
    expect(updatedSchedule.status).toBe('invoiced');

    // Verify invoice created
    const createdInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.billingId, schedule.id));
    expect(createdInvoices).toHaveLength(1);

    // Run billing worker second time — must skip processed item (Idempotency check)
    const res2 = await processBillingJob();
    const [stillProcessedSchedule] = await db
      .select()
      .from(billingSchedules)
      .where(eq(billingSchedules.id, schedule.id));

    expect(stillProcessedSchedule.status).toBe('invoiced');
    const invoiceCountAfterSecondRun = await db
      .select()
      .from(invoices)
      .where(eq(invoices.billingId, schedule.id));
    expect(invoiceCountAfterSecondRun).toHaveLength(1); // NO duplicate invoice created!
  });

  it('2. processDealHealthJob scans stalled deals idempotently', async () => {
    // Create a stalled quotation (last activity 5 days ago)
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const [stalledQuote] = await db
      .insert(quotations)
      .values({
        title: 'Stalled Deal',
        customerId: companyId,
        ownerId: userId,
        status: 'draft',
        lastActivityAt: fiveDaysAgo,
      })
      .returning();

    // First scan
    const res1 = await processDealHealthJob();
    expect(res1.inserted).toBeGreaterThanOrEqual(1);

    const alerts = await db
      .select()
      .from(dealHealthAlerts)
      .where(eq(dealHealthAlerts.quotationId, stalledQuote.id));
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(alerts[0].type).toBe('STALLED');

    // Second scan — deduplication check (no duplicate open alert for same quotation & type)
    const res2 = await processDealHealthJob();
    expect(res2.skipped).toBeGreaterThanOrEqual(1);
  });

  it('3. processRecommendationJob pre-computes recommendations for active quotes', async () => {
    const [activeQuote] = await db
      .insert(quotations)
      .values({
        title: 'Active Deal for Recs',
        customerId: companyId,
        ownerId: userId,
        status: 'draft',
      })
      .returning();

    const res = await processRecommendationJob();
    expect(res.scanned).toBeGreaterThanOrEqual(1);
    expect(res.errors).toBe(0);
  });

  it('4. processNotificationJob processes pending notifications idempotently', async () => {
    // Insert a pending notification
    const [notif] = await db
      .insert(notifications)
      .values({
        recipientId: userId,
        type: 'QUOTE_SUBMITTED',
        title: 'Quotation Submitted',
        message: 'Your quote is pending approval.',
        status: 'pending',
      })
      .returning();

    // First run
    const res1 = await processNotificationJob();
    expect(res1.sent).toBeGreaterThanOrEqual(1);

    const [updatedNotif] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notif.id));
    expect(updatedNotif.status).toBe('sent');
    expect(updatedNotif.sentAt).toBeDefined();

    // Second run — must skip sent item
    const res2 = await processNotificationJob();
    const [stillSentNotif] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notif.id));
    expect(stillSentNotif.status).toBe('sent');
  });

  it('5. runAllJobs executes full sweep across all workers', async () => {
    const summary = await runAllJobs();
    expect(summary.billing).toBeDefined();
    expect(summary.dealHealth).toBeDefined();
    expect(summary.recommendation).toBeDefined();
    expect(summary.notifications).toBeDefined();
  });
});
