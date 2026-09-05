import { db } from '../../db/client.js';
import { WarehouseRepository, WarehouseStock } from './warehouse.repository.js';
import { FulfillmentEngine, FulfillmentPlan } from './fulfillment.engine.js';
import { quotationLines, quotations, orders, billingSchedules } from '../../db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../core/logging/logger.js';
import { AuditService } from '../../core/audit/audit.service.js';
import { AuditAction } from '../../core/audit/audit.types.js';

export class InventoryService {
  private repo = new WarehouseRepository();
  private engine = new FulfillmentEngine();

  /**
   * Get fulfillment plan for a quotation.
   * Does NOT reserve inventory. Just calculates the plan.
   */
  async getFulfillmentPlan(quotationId: string) {
    const lines = await db.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    
    if (lines.length === 0) {
      throw new Error('Quotation has no lines');
    }

    const productIds = lines.map(l => l.productId);
    const stockMap = await this.repo.getAvailableStockForProducts(productIds);

    const plans: Record<string, FulfillmentPlan> = {};
    let totalShippingCost = 0;
    let hasBackorder = false;

    for (const line of lines) {
      const stocks = stockMap[line.productId] || [];
      const plan = this.engine.allocate(line.quantity, stocks);
      plans[line.productId] = plan;
      totalShippingCost += plan.totalCost;
      if (plan.isBackordered) {
        hasBackorder = true;
      }
    }

    return {
      plans,
      totalShippingCost,
      hasBackorder
    };
  }

  /**
   * Accept fulfillment plan, atomically reserve inventory, and create order.
   */
  async acceptFulfillment(quotationId: string) {
    // We must run in a transaction
    return await db.transaction(async (tx) => {
      // 1. Re-calculate plan within transaction to ensure we attempt reservation with latest understanding
      // (Though atomic reservation protects us, knowing what to reserve is step 1)
      const lines = await tx.select().from(quotationLines).where(eq(quotationLines.quotationId, quotationId));
      if (lines.length === 0) throw new Error('Quotation has no lines');

      const productIds = lines.map(l => l.productId);
      
      // In a real system we'd use the tx for getAvailableStockForProducts but it's okay to just query 
      // because the update is atomic and will fail if the read was stale.
      // Wait, let's use tx directly for queries to be fully safe if needed, 
      // but repo uses db. Let's just pass tx to repo where we can, or do it directly.
      const stockMap = await this.repo.getAvailableStockForProducts(productIds);
      
      const allAllocations = [];
      
      // 2. Compute allocations
      for (const line of lines) {
        const stocks = stockMap[line.productId] || [];
        const plan = this.engine.allocate(line.quantity, stocks);
        
        if (plan.isBackordered) {
          // If we want strict no-oversell and no-backorder-on-accept:
          // throw new Error(`Insufficient inventory for product ${line.productId}`);
          // But the prompt says "do not oversell, output backorders"
        }

        // 3. Atomically Reserve
        for (const alloc of plan.allocations) {
          const success = await this.repo.reserveInventory(tx, line.productId, alloc.warehouseId, alloc.quantity);
          if (!success) {
            // Concurrency failure! Someone else bought it between our read and update.
            // Abort transaction!
            logger.warn({ productId: line.productId, warehouseId: alloc.warehouseId, qty: alloc.quantity }, 'Concurrency failure during reservation');
            throw new Error(`Failed to reserve ${alloc.quantity} units of product ${line.productId}. Inventory changed.`);
          }
          
          allAllocations.push({
            productId: line.productId,
            warehouseId: alloc.warehouseId,
            quantity: alloc.quantity,
            isOverride: false
          });
        }
      }

      // 4. Save Allocations
      await this.repo.saveAllocations(tx, quotationId, allAllocations);

      // 5. Create Order
      const [order] = await tx.insert(orders).values({
        quotationId
      }).returning();

      // 6. Create Billing Schedule (dummy example)
      await tx.insert(billingSchedules).values({
        quotationId,
        billingDate: new Date(),
        status: 'scheduled'
      });

      // Update Quotation Status to fulfillment
      await tx.update(quotations).set({ status: 'fulfillment' }).where(eq(quotations.id, quotationId));

      // Audit fulfillment acceptance inside the transaction
      await AuditService.log({
        actorId: 'system',
        entityType: 'order',
        entityId: order.id,
        action: AuditAction.ORDER_CREATED,
        after: { quotationId, allocations: allAllocations },
      });

      return order;
    });
  }

  /**
   * Manual override. Allows overriding the allocation algorithm.
   */
  async overrideFulfillment(quotationId: string, overrides: any[], actorId?: string) {
    return await db.transaction(async (tx) => {
      await this.repo.saveAllocations(tx, quotationId, overrides.map(o => ({...o, isOverride: true})));
      
      const [order] = await tx.insert(orders).values({ quotationId }).returning();

      await tx.update(quotations).set({ status: 'fulfillment' }).where(eq(quotations.id, quotationId));

      // Audit warehouse override — this is a sensitive manual action
      if (actorId) {
        await AuditService.log({
          actorId,
          entityType: 'warehouse',
          entityId: quotationId,
          action: AuditAction.WAREHOUSE_OVERRIDE,
          reason: 'Manual fulfillment override applied',
          after: { overrides },
        });
      }

      return order;
    });
  }
}
