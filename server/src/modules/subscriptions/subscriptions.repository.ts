import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { subscriptions, products, orders, quotations, companies, quotationLines } from '../../db/schema/dealflow.js';

export const SubscriptionsRepository = {
  getDashboardData: async () => {
    const allSubs = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        interval: subscriptions.interval,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        productName: products.name,
        price: products.price,
        customerName: companies.name,
      })
      .from(subscriptions)
      .innerJoin(products, eq(subscriptions.productId, products.id))
      .innerJoin(orders, eq(subscriptions.orderId, orders.id))
      .innerJoin(quotations, eq(orders.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .orderBy(desc(subscriptions.createdAt));

    return allSubs;
  },

  getSubscriptionDetail: async (subscriptionId: string) => {
    const sub = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        interval: subscriptions.interval,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        productName: products.name,
        price: products.price,
        quotationId: quotations.id,
        customerName: companies.name,
      })
      .from(subscriptions)
      .innerJoin(products, eq(subscriptions.productId, products.id))
      .innerJoin(orders, eq(subscriptions.orderId, orders.id))
      .innerJoin(quotations, eq(orders.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!sub || sub.length === 0) return null;

    // Fetch the originating order lines to split them into One-Time and Recurring
    const lines = await db
      .select({
        id: quotationLines.id,
        productName: quotationLines.productNameSnapshot,
        quantity: quotationLines.quantity,
        total: quotationLines.total,
        isRecurring: products.isRecurring,
      })
      .from(quotationLines)
      .innerJoin(products, eq(quotationLines.productId, products.id))
      .where(eq(quotationLines.quotationId, sub[0].quotationId));

    const nextBillingDate = sub[0].currentPeriodEnd || new Date();

    return {
      subscription: sub[0],
      oneTimeLines: lines.filter(l => !l.isRecurring),
      recurringLines: lines.filter(l => l.isRecurring),
      billingSchedule: {
        nextBillingDate,
        interval: sub[0].interval || 'monthly',
      },
    };
  }
};