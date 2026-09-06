import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { db } from '../src/db/client.js';
import { products, upsells, quotations, quotationLines, companies } from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import { RecommendationEngine } from '../src/modules/recommendations/recommendation.engine.js';

describe('Recommendation API', () => {
  let customerId: string;
  let quotationId: string;
  let productAId: string;
  let productBId: string;
  let productCId: string; // Already in cart
  let productDId: string; // Low margin
  const mockUserId = randomUUID();

  beforeAll(async () => {
    // Setup Customer
    customerId = randomUUID();
    await db.insert(companies).values({
      id: customerId,
      name: 'Recommendation Test Corp',
    });

    // Setup Products
    productAId = randomUUID(); // High margin, Promoted
    productBId = randomUUID(); // Medium margin, not promoted
    productCId = randomUUID(); // Medium margin (in cart)
    productDId = randomUUID(); // Low margin

    await db.insert(products).values([
      { id: productAId, name: 'Prod A', price: 10000, cost: 4000, promoted: true }, // Margin = 60%
      { id: productBId, name: 'Prod B', price: 10000, cost: 7000, promoted: false }, // Margin = 30%
      { id: productCId, name: 'Prod C', price: 10000, cost: 7000, promoted: false }, // Margin = 30%
      { id: productDId, name: 'Prod D', price: 10000, cost: 9500, promoted: false }, // Margin = 5%
    ]);

    // Setup Quotation
    quotationId = randomUUID();
    await db.insert(quotations).values({
      id: quotationId,
      title: 'Recommendation Quote',
      customerId,
      ownerId: null,
      status: 'draft',
    });

    // Add Product C to Quotation Lines (Cart)
    await db.insert(quotationLines).values({
      quotationId,
      productId: productCId,
      productNameSnapshot: 'Prod C',
      unitPrice: 10000,
      quantity: 1,
      subtotal: 10000,
      total: 10000,
    });

    // Setup Upsells from Product C to A, B, and D
    await db.insert(upsells).values([
      { sourceProductId: productCId, targetProductId: productAId },
      { sourceProductId: productCId, targetProductId: productBId },
      { sourceProductId: productCId, targetProductId: productDId },
      // What if C recommends C? (should be filtered out)
      { sourceProductId: productCId, targetProductId: productCId },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(upsells).where(eq(upsells.sourceProductId, productCId));
    await db.delete(quotationLines).where(eq(quotationLines.quotationId, quotationId));
    await db.delete(quotations).where(eq(quotations.id, quotationId));
    await db.delete(products).where(eq(products.id, productAId));
    await db.delete(products).where(eq(products.id, productBId));
    await db.delete(products).where(eq(products.id, productCId));
    await db.delete(products).where(eq(products.id, productDId));
    await db.delete(companies).where(eq(companies.id, customerId));
  });

  it('should return top recommendations correctly filtered and scored', async () => {
    const engine = new RecommendationEngine();
    const recommendations = await engine.getRecommendations(quotationId, 10); // 10% margin threshold

    // Should not include Product C (already in cart)
    expect(recommendations.find(r => r.productId === productCId)).toBeUndefined();
    
    // Should not include Product D (margin = 5% < 10%)
    expect(recommendations.find(r => r.productId === productDId)).toBeUndefined();

    // Should include A and B
    expect(recommendations.length).toBe(2);

    // Product A is promoted (score 15), Product B is not (score 10)
    // A should be ranked first
    expect(recommendations[0].productId).toBe(productAId);
    expect(recommendations[0].score).toBe(15);
    expect(recommendations[0].promoted).toBe(true);
    expect(recommendations[0].promotionTag).toBe('Promo');
    expect(recommendations[0].price).toBe(10000);

    expect(recommendations[1].productId).toBe(productBId);
    expect(recommendations[1].score).toBe(10);
    expect(recommendations[1].promoted).toBe(false);
    expect(recommendations[1].promotionTag).toBeUndefined();
  });
});
