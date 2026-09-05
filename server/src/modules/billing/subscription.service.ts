import { db } from '../../db/client.js';
import { subscriptions } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { BillingEngine } from './billing.engine.js';

export class SubscriptionService {
  constructor(private billingEngine: BillingEngine) {}

  /**
   * Activates subscriptions for recurring lines.
   */
  async activateSubscriptions(tx: any, orderId: string, recurringLines: any[]) {
    if (recurringLines.length === 0) return [];

    const subsToInsert = recurringLines.map(line => {
      const now = new Date();
      let end = new Date(now);

      if (line.billingInterval === 'yearly') {
        end.setFullYear(now.getFullYear() + 1);
      } else if (line.billingInterval === 'quarterly') {
        end.setMonth(now.getMonth() + 3);
      } else { // default monthly
        end.setMonth(now.getMonth() + 1);
      }

      return {
        orderId,
        productId: line.productId,
        status: 'active',
        interval: line.billingInterval || 'monthly',
        currentPeriodStart: now,
        currentPeriodEnd: end,
      };
    });

    // @ts-ignore
    return await tx.insert(subscriptions).values(subsToInsert).returning();
  }

  /**
   * Cancels a subscription and optionally triggers a partial refund.
   */
  async cancelSubscription(subscriptionId: string, idempotencyKey: string) {
    return await db.transaction(async (tx) => {
      const [sub] = await tx.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
      if (!sub) throw new Error('Subscription not found');
      if (sub.status === 'canceled') return sub;

      const now = new Date();
      const refundPercentage = this.billingEngine.calculateProration(sub, now);

      const [updated] = await tx.update(subscriptions)
        .set({ status: 'canceled' })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      // In a real system we would calculate exact price paid from billing history.
      // For this implementation, we simulate refund calculation.
      if (refundPercentage > 0) {
        // e.g., 1000 * 0.5 = 500
        const refundAmount = Math.floor(1000 * refundPercentage); 
        await this.billingEngine.processRefund(sub.orderId, refundAmount, idempotencyKey);
      }

      return updated;
    });
  }
}
