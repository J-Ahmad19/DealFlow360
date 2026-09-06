import { db } from '../../db/client.js';
import { subscriptions, orders, quotations, companies, products, quotationLines } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { BillingEngine } from './billing.engine.js';
import { logger } from '../../core/logging/logger.js';

export class SubscriptionService {
  constructor(private billingEngine: BillingEngine) {}

  /**
   * Fetches rich detail for the Subscription page, including the original order's one-time items.
   */
  async getSubscriptionDetail(subscriptionId: string) {
    const [sub] = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        interval: subscriptions.interval,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        orderId: subscriptions.orderId,
        productName: products.name,
        productPrice: products.price,
        customerName: companies.name,
        quotationId: quotations.id,
      })
      .from(subscriptions)
      .innerJoin(products, eq(subscriptions.productId, products.id))
      .innerJoin(orders, eq(subscriptions.orderId, orders.id))
      .innerJoin(quotations, eq(orders.quotationId, quotations.id))
      .innerJoin(companies, eq(quotations.customerId, companies.id))
      .where(eq(subscriptions.id, subscriptionId));

    if (!sub) throw new Error('Subscription not found');

    // Fetch original lines to separate one-time vs recurring history
    const allLines = await db
      .select({
        productName: quotationLines.productNameSnapshot,
        quantity: quotationLines.quantity,
        total: quotationLines.total,
        isRecurring: products.isRecurring,
      })
      .from(quotationLines)
      .leftJoin(products, eq(quotationLines.productId, products.id))
      .where(eq(quotationLines.quotationId, sub.quotationId));

    const productPrice = Number((await db.select({ price: products.price }).from(products).where(eq(products.id, sub.productId))).at(0)?.price || 0);
    const prorationRate = this.billingEngine.calculateProration({ ...sub, currentPeriodStart: sub.currentPeriodStart || new Date() }, new Date());

    return {
      subscription: sub,
      oneTimeLines: allLines.filter(l => !l.isRecurring),
      recurringLines: allLines.filter(l => l.isRecurring),
      billingSchedule: {
        nextBillingDate: sub.currentPeriodEnd,
        interval: sub.interval,
      },
      proration: {
        refundRate: prorationRate,
        refundAmount: Math.round(productPrice * prorationRate),
        creditNoteRequired: prorationRate > 0,
      },
    };
  }

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
      } else { 
        end.setMonth(now.getMonth() + 1); // default monthly
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

    return await tx.insert(subscriptions).values(subsToInsert).returning();
  }

  /**
   * Modifies a subscription (e.g., upgrade/downgrade or billing interval change).
   * This keeps the real subscription record in sync with the user-facing workflow.
   */
  async modifySubscription(subscriptionId: string, idempotencyKey: string, newInterval?: 'monthly' | 'quarterly' | 'yearly') {
    logger.info({ subscriptionId, idempotencyKey, newInterval }, 'Subscription modification requested');

    const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
    if (!existing) throw new Error('Subscription not found');

    const nextInterval = newInterval || existing.interval || 'monthly';
    const now = new Date();
    const nextPeriodEnd = new Date(now);

    if (nextInterval === 'yearly') {
      nextPeriodEnd.setFullYear(now.getFullYear() + 1);
    } else if (nextInterval === 'quarterly') {
      nextPeriodEnd.setMonth(now.getMonth() + 3);
    } else {
      nextPeriodEnd.setMonth(now.getMonth() + 1);
    }

    const [updated] = await db.update(subscriptions)
      .set({
        interval: nextInterval,
        currentPeriodStart: now,
        currentPeriodEnd: nextPeriodEnd,
        status: 'active',
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    const [product] = await db.select({ price: products.price }).from(products).where(eq(products.id, existing.productId));
    const creditNote = Math.max(0, Math.round((product?.price || 0) * this.billingEngine.calculateProration({ ...existing, currentPeriodStart: existing.currentPeriodStart || now }, new Date())));

    return {
      ...updated,
      proration: {
        creditNote,
        creditNoteRequired: creditNote > 0,
      },
    };
  }

  /**
   * Cancels a subscription and automatically triggers a partial refund based on unused days.
   */
  async cancelSubscription(subscriptionId: string, idempotencyKey: string) {
    return await db.transaction(async (tx) => {
      const [sub] = await tx.select().from(subscriptions).where(eq(subscriptions.id, subscriptionId));
      if (!sub) throw new Error('Subscription not found');
      if (sub.status === 'canceled') return sub;

      const now = new Date();
      // Calculate how much of the billing cycle was unused (0.0 to 1.0)
      const refundPercentage = this.billingEngine.calculateProration(sub, now);

      const [updated] = await tx.update(subscriptions)
        .set({ status: 'canceled' })
        .where(eq(subscriptions.id, subscriptionId))
        .returning();

      let refundAmount = 0;
      if (refundPercentage > 0) {
        const [prod] = await tx.select().from(products).where(eq(products.id, sub.productId));
        refundAmount = Math.floor((prod?.price || 0) * refundPercentage);

        if (refundAmount > 0) {
          await this.billingEngine.processRefund(sub.orderId, refundAmount, idempotencyKey);
          logger.info({ subscriptionId, refundAmount }, 'Partial refund processed for cancellation');
        }
      }

      return {
        ...updated,
        proration: {
          refundAmount,
          creditNoteRequired: refundAmount > 0,
          trigger: refundAmount > 0 ? 'unused-period-proration' : null,
        },
      };
    });
  }
}