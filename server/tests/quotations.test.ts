import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/server.js';
import { db } from '../src/db/client.js';
import { users, companies, products, quotations, quotationLines, auditLogs } from '../src/db/schema/dealflow.js';
import { eq } from 'drizzle-orm';
import * as authMiddleware from '../src/core/middleware/authenticate.js';

describe('Quotations API', () => {
  let customerId: string;
  let productId: string;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    // Mock authentication
    jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req, res, next) => {
      (req as any).user = { id: mockUserId, role: 'sales_rep' };
      next();
    });

    // Setup dummy data
    const [user] = await db
      .insert(users)
      .values({
        id: mockUserId,
        email: 'salesrep_quotations@test.com',
        fullName: 'Sales Rep Quotations',
        role: 'sales_rep',
      })
      .returning();

    const [company] = await db
      .insert(companies)
      .values({
        name: 'Test Customer for Quotations',
        domain: 'quotations.com',
      })
      .returning();
    customerId = company.id;

    const [product] = await db
      .insert(products)
      .values({
        name: 'Test Quotation Product',
        price: 1000, // 10.00
      })
      .returning();
    productId = product.id;
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(companies).where(eq(companies.id, customerId));
    await db.delete(users).where(eq(users.id, mockUserId));
  });

  describe('POST /api/v1/quotations', () => {
    it('should create a quotation with valid data', async () => {
      const payload = {
        title: 'New Quotation 1',
        customerId,
        lines: [
          {
            productId,
            quantity: 2,
            discount: 10,
          },
        ],
      };

      const response = await request(app).post('/api/v1/quotations').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('New Quotation 1');
      expect(response.body.status).toBe('draft');
      expect(response.body.ownerId).toBe(mockUserId);
      expect(response.body.lines).toHaveLength(1);

      // Financials check
      // unitPrice = 1000, quantity = 2, base = 2000
      // discount = 10%, discountAmt = 200, subtotal = 1800
      // taxRate = 10%, tax = 180, total = 1980
      const line = response.body.lines[0];
      expect(line.unitPrice).toBe(1000);
      expect(line.subtotal).toBe(1800);
      expect(line.total).toBe(1980);

      expect(response.body.subtotal).toBe(1800);
      expect(response.body.tax).toBe(180);
      expect(response.body.amount).toBe(1980); // total

      // Cleanup
      await db.delete(quotationLines).where(eq(quotationLines.quotationId, response.body.id));
      await db.delete(quotations).where(eq(quotations.id, response.body.id));
      await db.delete(auditLogs).where(eq(auditLogs.entityId, response.body.id));
    });

    it('should reject invalid discount', async () => {
      const payload = {
        title: 'Bad Discount',
        customerId,
        lines: [
          {
            productId,
            quantity: 2,
            discount: 150,
          },
        ],
      };

      const response = await request(app).post('/api/v1/quotations').send(payload);
      expect(response.status).toBe(400);
    });
  });

  describe('State Machine & Transitions', () => {
    let qId: string;

    beforeAll(async () => {
      const [q] = await db
        .insert(quotations)
        .values({
          title: 'State Machine Test',
          customerId,
          ownerId: mockUserId,
          status: 'draft',
        })
        .returning();
      qId = q.id;
    });

    afterAll(async () => {
      await db.delete(quotations).where(eq(quotations.id, qId));
      await db.delete(auditLogs).where(eq(auditLogs.entityId, qId));
    });

    it('should transition from draft to pending_approval via submit', async () => {
      const response = await request(app).post(`/api/v1/quotations/${qId}/submit`).send();
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('pending_approval');
    });

    it('should transition from pending_approval to revision_required via revise', async () => {
      // Temporarily mock role to admin to pass requireRole for revise
      jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req, res, next) => {
        (req as any).user = { id: mockUserId, role: 'admin' };
        next();
      });

      const response = await request(app).post(`/api/v1/quotations/${qId}/revise`).send();
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('revision_required');

      // Reset mock
      jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req, res, next) => {
        (req as any).user = { id: mockUserId, role: 'sales_rep' };
        next();
      });
    });

    it('should fail to revise a draft quotation', async () => {
      const [q] = await db
        .insert(quotations)
        .values({
          title: 'State Machine Fail Test',
          customerId,
          ownerId: mockUserId,
          status: 'draft',
        })
        .returning();

      // Temporarily mock role to admin
      jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req, res, next) => {
        (req as any).user = { id: mockUserId, role: 'admin' };
        next();
      });

      const response = await request(app).post(`/api/v1/quotations/${q.id}/revise`).send();
      expect(response.status).toBe(400); // Invalid state transition

      await db.delete(quotations).where(eq(quotations.id, q.id));
      await db.delete(auditLogs).where(eq(auditLogs.entityId, q.id));

      // Reset mock
      jest.spyOn(authMiddleware, 'authenticate').mockImplementation((req, res, next) => {
        (req as any).user = { id: mockUserId, role: 'sales_rep' };
        next();
      });
    });
  });
});
