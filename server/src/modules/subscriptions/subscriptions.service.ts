import { db } from '../../db/client.js';
import { SubscriptionsRepository } from './subscriptions.repository.js';
import { subscriptions, orders, quotations, companies, products } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';

export const SubscriptionsService = {
  create: async (data: { customerId: string; productId: string; interval?: 'monthly' | 'quarterly' | 'yearly'; orderId?: string }) => {
    const interval = data.interval ?? 'monthly';

    const [customer] = await db.select().from(companies).where(eq(companies.id, data.customerId));
    const [product] = await db.select().from(products).where(eq(products.id, data.productId));

    if (!customer) throw new Error('Customer not found');
    if (!product) throw new Error('Product not found');

    const orderPayload = {
      quotationId: null as string | null,
    };

    const [order] = await db.insert(orders).values(orderPayload).returning();

    const now = new Date();
    const end = new Date(now);
    if (interval === 'yearly') end.setFullYear(now.getFullYear() + 1);
    else if (interval === 'quarterly') end.setMonth(now.getMonth() + 3);
    else end.setMonth(now.getMonth() + 1);

    const [sub] = await db.insert(subscriptions).values({
      orderId: order.id,
      productId: product.id,
      status: 'active',
      interval,
      currentPeriodStart: now,
      currentPeriodEnd: end,
    }).returning();

    return {
      id: sub.id,
      orderId: order.id,
      customerId: customer.id,
      productId: product.id,
      status: 'active',
      interval,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      customerName: customer.name,
      productName: product.name,
    };
  },

  getDashboard: async () => {
    const subs = await SubscriptionsRepository.getDashboardData();
    let activeCount = 0;
    let canceledCount = 0;

    const formattedList = subs.map(sub => {
      if (sub.status === 'active') activeCount++;
      else if (sub.status === 'canceled') canceledCount++;

      return {
        id: sub.id,
        customerName: sub.customerName || 'Unknown',
        productName: sub.productName,
        interval: sub.interval,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
      };
    });

    return {
      stats: {
        active: activeCount,
        paused: 0,
        canceled: canceledCount,
      },
      list: formattedList
    };
  },

  getDetail: async (id: string) => {
    return await SubscriptionsRepository.getSubscriptionDetail(id);
  }
};