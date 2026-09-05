import { SubscriptionsRepository } from './subscriptions.repository.js';

export const SubscriptionsService = {
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
        paused: 0, // Mocked to match wireframe requirements
        canceled: canceledCount,
      },
      list: formattedList
    };
  },

  getDetail: async (id: string) => {
    return await SubscriptionsRepository.getSubscriptionDetail(id);
  }
};