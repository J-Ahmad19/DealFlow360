import { db } from '../../db/client.js';
import { payments, billingSchedules, invoices } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../core/logging/logger.js';

export class BillingEngine {
  /**
   * Generates billing schedules and immediate invoices.
   */
  async generateSchedules(tx: any, orderId: string, lines: any[]) {
    const oneTimeLines = lines.filter(l => !l.isRecurring);
    const recurringLines = lines.filter(l => l.isRecurring);

    // 1. One-time items -> immediate invoice
    if (oneTimeLines.length > 0) {
      const amount = oneTimeLines.reduce((sum, l) => sum + l.total, 0);
      
      const [schedule] = await tx.insert(billingSchedules).values({
        orderId,
        billingDate: new Date(),
        status: 'scheduled',
        amount,
        isRecurring: false,
      }).returning();

      await tx.insert(invoices).values({
        billingId: schedule.id,
        status: 'draft',
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // net 30
      });
    }

    // 2. Recurring items -> Set up first billing schedule
    if (recurringLines.length > 0) {
      const amount = recurringLines.reduce((sum, l) => sum + l.total, 0);
      
      // Usually, the first charge might happen immediately or at the end of the month
      // Let's assume immediate for the first period
      const [schedule] = await tx.insert(billingSchedules).values({
        orderId,
        billingDate: new Date(),
        status: 'scheduled',
        amount,
        isRecurring: true,
      }).returning();
      
      await tx.insert(invoices).values({
        billingId: schedule.id,
        status: 'draft',
        dueAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // net 15 for subscriptions
      });
    }
  }

  /**
   * Process a payment idempotently.
   */
  async processPayment(orderId: string, amount: number, idempotencyKey: string) {
    return await db.transaction(async (tx) => {
      // Check idempotency key
      const existing = await tx.select().from(payments).where(eq(payments.idempotencyKey, idempotencyKey));
      if (existing.length > 0) {
        logger.info({ idempotencyKey }, 'Payment already processed for this key');
        return existing[0]; // Already processed, safe to return
      }

      // Record charge
      const [payment] = await tx.insert(payments).values({
        orderId,
        amount,
        type: 'charge',
        idempotencyKey
      }).returning();

      return payment;
    });
  }

  /**
   * Calculate proration on cancellation.
   */
  calculateProration(subscription: any, cancelDate: Date): number {
    const start = new Date(subscription.currentPeriodStart).getTime();
    const end = new Date(subscription.currentPeriodEnd).getTime();
    const cancel = cancelDate.getTime();

    if (cancel >= end || cancel <= start) {
      return 0; // Out of bounds, no refund
    }

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const unusedDays = (end - cancel) / (1000 * 60 * 60 * 24);

    // Assuming we don't have the exact price on the subscription object here for simplicity,
    // we would typically pass the price in. Let's return the percentage.
    const refundPercentage = unusedDays / totalDays;
    
    return refundPercentage; // Value between 0 and 1
  }

  async processRefund(orderId: string, amount: number, idempotencyKey: string) {
    return await db.transaction(async (tx) => {
      const existing = await tx.select().from(payments).where(eq(payments.idempotencyKey, idempotencyKey));
      if (existing.length > 0) {
        return existing[0];
      }

      const [refund] = await tx.insert(payments).values({
        orderId,
        amount,
        type: 'refund',
        idempotencyKey
      }).returning();

      return refund;
    });
  }
}
