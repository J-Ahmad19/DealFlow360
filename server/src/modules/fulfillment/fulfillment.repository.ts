import { inArray, eq, desc, and, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { inventory, warehouses, products, quotations, companies, quotationAllocations, quotationLines } from '../../db/schema/dealflow.js';

export const FulfillmentRepository = {
  getDashboardData: async () => {
    const stockData = await db
      .select({
        id: inventory.id,
        warehouseId: warehouses.id,
        warehouseName: warehouses.name,
        productId: products.id,
        productName: products.name,
        available: inventory.availableQty,
        reserved: inventory.reservedQty,
      })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .innerJoin(products, eq(inventory.productId, products.id));

    const pendingOrders = await db
      .select({
        id: quotations.id,
        customerName: companies.name,
        status: quotations.status,
      })
      .from(quotations)
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .where(inArray(quotations.status, ['confirmed', 'fulfillment']))
      .orderBy(desc(quotations.updatedAt));

    return { stock: stockData, orders: pendingOrders };
  },

  getAvailableStockForProducts: async (tx: any, productIds: string[]) => {
    if (productIds.length === 0) return {};
    
    // Uses the transaction client (tx) to ensure consistent reads during ACID operations
    const stocks = await tx
      .select({
        productId: inventory.productId,
        warehouseId: warehouses.id,
        warehouseName: warehouses.name,
        availableQty: inventory.availableQty,
        baseShippingCost: warehouses.baseShippingCost,
      })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .where(inArray(inventory.productId, productIds));

    const stockMap: Record<string, any[]> = {};
    for (const stock of stocks) {
      if (!stockMap[stock.productId]) stockMap[stock.productId] = [];
      stockMap[stock.productId].push(stock);
    }
    return stockMap;
  },

  reserveInventory: async (tx: any, productId: string, warehouseId: string, qty: number) => {
    if (qty === 0) return true;

    // ACID Consistency: The WHERE clause guarantees we never dip below 0
    const res = await tx.update(inventory).set({
      availableQty: sql`${inventory.availableQty} - ${qty}`,
      reservedQty: sql`${inventory.reservedQty} + ${qty}`
    })
    .where(
      and(
        eq(inventory.productId, productId), 
        eq(inventory.warehouseId, warehouseId), 
        sql`${inventory.availableQty} >= ${qty}`
      )
    ).returning();

    return res.length > 0; // Returns false if stock was insufficient
  },

  saveAllocations: async (tx: any, quotationId: string, allocations: any[]) => {
    if (allocations.length === 0) return;
    const mapped = allocations.map(a => ({
      quotationId,
      productId: a.productId,
      warehouseId: a.warehouseId,
      quantity: a.quantity,
      isOverride: a.isOverride || false
    }));
    await tx.insert(quotationAllocations).values(mapped);
  }
};