import { randomUUID } from 'node:crypto';
import { db } from '../src/db/client.js';
import { products, warehouses, inventory, quotations, quotationLines, companies, orders, billingSchedules, quotationAllocations } from '../src/db/schema/dealflow.js';
import { eq, inArray } from 'drizzle-orm';
import { FulfillmentEngine } from '../src/modules/fulfillment/fulfillment.engine.js';
import { InventoryService } from '../src/modules/fulfillment/inventory.service.js';

describe('Fulfillment System', () => {
  let customerId: string;
  let productId: string;
  let warehouse1Id: string;
  let warehouse2Id: string;
  let quotationAId: string;
  let quotationBId: string;

  beforeAll(async () => {
    customerId = randomUUID();
    await db.insert(companies).values({ id: customerId, name: 'Fulfillment Test Corp' });

    productId = randomUUID();
    await db.insert(products).values({ id: productId, name: 'Limited Stock Product', price: 1000, cost: 500 });

    warehouse1Id = randomUUID();
    warehouse2Id = randomUUID();
    await db.insert(warehouses).values([
      { id: warehouse1Id, name: 'WH-1', baseShippingCost: 50 },
      { id: warehouse2Id, name: 'WH-2', baseShippingCost: 75 },
    ]);

    // Setup inventory: 10 units total
    await db.insert(inventory).values([
      { productId, warehouseId: warehouse1Id, availableQty: 10, reservedQty: 0 },
    ]);

    // Setup Quotation A (requires 7)
    quotationAId = randomUUID();
    await db.insert(quotations).values({ id: quotationAId, title: 'Quote A', customerId, status: 'approved' });
    await db.insert(quotationLines).values({
      quotationId: quotationAId, productId, productNameSnapshot: 'Product', unitPrice: 1000, quantity: 7, subtotal: 7000, total: 7000
    });

    // Setup Quotation B (requires 7)
    quotationBId = randomUUID();
    await db.insert(quotations).values({ id: quotationBId, title: 'Quote B', customerId, status: 'approved' });
    await db.insert(quotationLines).values({
      quotationId: quotationBId, productId, productNameSnapshot: 'Product', unitPrice: 1000, quantity: 7, subtotal: 7000, total: 7000
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(billingSchedules).where(inArray(billingSchedules.quotationId, [quotationAId, quotationBId]));
    await db.delete(orders).where(inArray(orders.quotationId, [quotationAId, quotationBId]));
    await db.delete(quotationAllocations).where(inArray(quotationAllocations.quotationId, [quotationAId, quotationBId]));
    
    await db.delete(quotationLines).where(eq(quotationLines.quotationId, quotationAId));
    await db.delete(quotations).where(eq(quotations.id, quotationAId));
    await db.delete(quotationLines).where(eq(quotationLines.quotationId, quotationBId));
    await db.delete(quotations).where(eq(quotations.id, quotationBId));
    await db.delete(inventory).where(eq(inventory.productId, productId));
    await db.delete(warehouses).where(eq(warehouses.id, warehouse1Id));
    await db.delete(warehouses).where(eq(warehouses.id, warehouse2Id));
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(companies).where(eq(companies.id, customerId));
  });

  it('FulfillmentEngine: should minimize shipments and pick cheapest base shipping cost', () => {
    const engine = new FulfillmentEngine();
    const stocks = [
      { warehouseId: 'w1', warehouseName: 'W1', availableQty: 10, baseShippingCost: 100 },
      { warehouseId: 'w2', warehouseName: 'W2', availableQty: 15, baseShippingCost: 50 }, // Cheapest that can fulfill 5
      { warehouseId: 'w3', warehouseName: 'W3', availableQty: 2, baseShippingCost: 10 },
    ];

    const plan = engine.allocate(5, stocks);
    
    // Should pick w2 as it is single source with lowest cost
    expect(plan.allocations.length).toBe(1);
    expect(plan.allocations[0].warehouseId).toBe('w2');
    expect(plan.allocations[0].quantity).toBe(5);
    expect(plan.totalCost).toBe(50);
  });

  it('FulfillmentEngine: should split shipments when necessary and apply split penalty', () => {
    const engine = new FulfillmentEngine();
    const stocks = [
      { warehouseId: 'w1', warehouseName: 'W1', availableQty: 4, baseShippingCost: 20 },
      { warehouseId: 'w2', warehouseName: 'W2', availableQty: 3, baseShippingCost: 30 }, 
    ];

    const plan = engine.allocate(7, stocks);
    
    // Should pick both w1 and w2
    expect(plan.allocations.length).toBe(2);
    expect(plan.totalCost).toBe(20 + 30 + 10); // 20 + 30 + 10 (split penalty)
  });

  it('InventoryService: should atomically reserve inventory without overselling (Concurrency Test)', async () => {
    const service = new InventoryService();

    // Fire both accept requests at the same time
    // One should succeed, one should fail due to insufficient stock (concurrency protection)
    const results = await Promise.allSettled([
      service.acceptFulfillment(quotationAId),
      service.acceptFulfillment(quotationBId)
    ]);

    let successCount = 0;
    let failCount = 0;

    results.forEach(res => {
      if (res.status === 'fulfilled') successCount++;
      if (res.status === 'rejected') failCount++;
    });

    // Only one can succeed because 7 + 7 > 10
    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    // Verify inventory state
    const inv = await db.select().from(inventory).where(eq(inventory.productId, productId));
    expect(inv[0].availableQty).toBe(3); // 10 - 7
    expect(inv[0].reservedQty).toBe(7);  // 0 + 7
  });
});
