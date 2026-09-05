import { sql, eq, inArray, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { inventory, warehouses, quotationAllocations } from '../../db/schema/dealflow.js';

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  baseShippingCost: number;
  availableQty: number;
}

export class WarehouseRepository {
  /**
   * Retrieves available stock across all warehouses for a given list of products.
   */
  async getAvailableStockForProducts(productIds: string[]): Promise<Record<string, WarehouseStock[]>> {
    const stockMap: Record<string, WarehouseStock[]> = {};
    
    if (productIds.length === 0) return stockMap;

    const rows = await db
      .select({
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        warehouseName: warehouses.name,
        baseShippingCost: warehouses.baseShippingCost,
        availableQty: inventory.availableQty,
      })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .where(inArray(inventory.productId, productIds));

    for (const row of rows) {
      if (!stockMap[row.productId]) {
        stockMap[row.productId] = [];
      }
      stockMap[row.productId].push({
        warehouseId: row.warehouseId,
        warehouseName: row.warehouseName,
        baseShippingCost: row.baseShippingCost,
        availableQty: row.availableQty,
      });
    }

    return stockMap;
  }

  /**
   * Atomically reserve inventory for a specific product and warehouse.
   * Returns true if successful, false if insufficient inventory (concurrency failure).
   * Note: This must be run inside a transaction if part of a larger operation, 
   * but works atomically on its own.
   */
  async reserveInventory(tx: any, productId: string, warehouseId: string, qty: number): Promise<boolean> {
    if (qty === 0) return true;

    // UPDATE inventory
    // SET available_qty = available_qty - $qty, reserved_qty = reserved_qty + $qty
    // WHERE product_id = $productId AND warehouse_id = $warehouseId AND available_qty >= $qty
    const result = await tx.execute(sql`
      UPDATE ${inventory}
      SET available_qty = available_qty - ${qty},
          reserved_qty = reserved_qty + ${qty}
      WHERE product_id = ${productId}
        AND warehouse_id = ${warehouseId}
        AND available_qty >= ${qty}
    `);

    // In 'pg', result.rowCount indicates affected rows.
    return result.rowCount > 0;
  }

  /**
   * Save allocations to the database.
   */
  async saveAllocations(tx: any, quotationId: string, allocations: any[]) {
    if (allocations.length === 0) return;
    
    await tx.insert(quotationAllocations).values(
      allocations.map((a) => ({
        quotationId,
        productId: a.productId,
        warehouseId: a.warehouseId,
        quantity: a.quantity,
        isOverride: a.isOverride || false,
      }))
    );
  }
}
