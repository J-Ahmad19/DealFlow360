import { db } from '../../db/client.js';
import { quotations, quotationLines, orders, products } from '../../db/schema/dealflow.js';
import { eq, inArray } from 'drizzle-orm';
import { BillingEngine } from './billing.engine.js';
import { SubscriptionService } from './subscription.service.js';

export class OrderService {
  constructor(
    private billingEngine: BillingEngine,
    private subscriptionService: SubscriptionService
  ) {}

  /**
   * Convert an approved quotation to an order and generate initial billing schedules.
   */
  async createOrderFromQuotation(quotationId: string) {
    return await db.transaction(async (tx) => {
      // 1. Fetch quotation
      const [quotation] = await tx.select().from(quotations).where(eq(quotations.id, quotationId));
      if (!quotation) throw new Error('Quotation not found');
      if (quotation.status !== 'approved') throw new Error('Quotation must be approved to create an order');

      // 2. Fetch lines
      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      if (lines.length === 0) throw new Error('Quotation has no lines');

      // 3. Create order
      const [order] = await tx.insert(orders).values({
        quotationId
      }).returning();

      // 4. Determine recurring vs one-time
      const productIds = lines.map(l => l.productId).filter(Boolean) as string[];
      let prods: any[] = [];
      if (productIds.length > 0) {
        prods = await tx.select().from(products).where(inArray(products.id, productIds));
      }
      
      const productMap = new Map(prods.map(p => [p.id, p]));

      const enrichedLines = lines.map(l => {
        const p = l.productId ? productMap.get(l.productId) : null;
        return {
          ...l,
          isRecurring: p?.isRecurring || false,
          billingInterval: p?.billingInterval || null,
        };
      });

      // 5. Generate schedules and invoices
      await this.billingEngine.generateSchedules(tx, order.id, enrichedLines);

      // 6. Activate subscriptions
      const recurringLines = enrichedLines.filter(l => l.isRecurring);
      await this.subscriptionService.activateSubscriptions(tx, order.id, recurringLines);

      // (Optional) generate orderLines if required by business logic. 
      // For this implementation, we rely on quotationLines for details or we could copy them to orderLines.
      // Omitted to keep it simple, but usually you'd copy to order_lines.

      return order;
    });
  }
}
