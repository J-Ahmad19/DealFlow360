import { db } from '../../db/client.js';
import { FulfillmentRepository } from './fulfillment.repository.js';
import { FulfillmentEngine } from './fulfillment.engine.js';
import { quotationLines, quotations, orders, billingSchedules, companies } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';

export class FulfillmentService {
  private repo = FulfillmentRepository;
  private engine = new FulfillmentEngine();

  async getDashboard() {
    return await this.repo.getDashboardData();
  }

  async getFulfillmentPlan(quotationId: string) {
    const q = await db
      .select({
        id: quotations.id,
        status: quotations.status,
        customerName: companies.name,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .where(eq(quotations.id, quotationId))
      .limit(1);

    if (!q || q.length === 0) throw new Error('Quotation not found');

    const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    if (lines.length === 0) return { order: q[0], splits: [], hasBackorder: false };

    // We pass `db` here as it's a read-only projection
    const productIds = lines.map(l => l.productId);
    const stockMap = await this.repo.getAvailableStockForProducts(db, productIds);

    const warehouseSummary: Record<string, { warehouseName: string, quantity: number, cost: number, shipments: number }> = {};
    let hasBackorder = false;

    for (const line of lines) {
      const stocks = stockMap[line.productId] || [];
      const plan = this.engine.allocate(line.quantity, stocks);
      
      if (plan.isBackordered) hasBackorder = true;

      for (const alloc of plan.allocations) {
        if (!warehouseSummary[alloc.warehouseId]) {
          warehouseSummary[alloc.warehouseId] = { warehouseName: alloc.warehouseName, quantity: 0, cost: 0, shipments: 1 };
        }
        warehouseSummary[alloc.warehouseId].quantity += alloc.quantity;
        warehouseSummary[alloc.warehouseId].cost += alloc.cost;
      }
    }

    return {
      order: q[0],
      splits: Object.values(warehouseSummary),
      hasBackorder
    };
  }

  async acceptFulfillment(quotationId: string) {
    // ACID Atomicity: db.transaction ensures all or nothing.
    return await db.transaction(async (tx) => {
      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      if (lines.length === 0) throw new Error('Quotation has no lines to fulfill');

      const productIds = lines.map(l => l.productId);
      const stockMap = await this.repo.getAvailableStockForProducts(tx, productIds);
      const allAllocations = [];
      
      for (const line of lines) {
        const stocks = stockMap[line.productId] || [];
        const plan = this.engine.allocate(line.quantity, stocks);

        for (const alloc of plan.allocations) {
          const success = await this.repo.reserveInventory(tx, line.productId, alloc.warehouseId, alloc.quantity);
          
          if (!success) {
            // Throwing an error triggers an automatic rollback of the entire transaction
            throw new Error(`Concurrency constraint failed. Insufficient inventory for product ${line.productNameSnapshot}.`);
          }
          
          allAllocations.push({
            productId: line.productId,
            warehouseId: alloc.warehouseId,
            quantity: alloc.quantity,
            isOverride: false
          });
        }
      }

      await this.repo.saveAllocations(tx, quotationId, allAllocations);

      const [order] = await tx.insert(orders).values({ quotationId }).returning();

      await tx.insert(billingSchedules).values({
        orderId: order.id,
        billingDate: new Date(),
        status: 'scheduled'
      });

      await tx.update(quotations).set({ status: 'fulfillment' }).where(eq(quotations.id, quotationId));

      return order;
    });
  }
}