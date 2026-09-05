import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { portalAuthRoutes } from '../src/modules/portalAuth/portalAuth.routes.js';
import { authenticatePortal } from '../src/core/middleware/authenticatePortal.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';
import { db } from '../src/db/client.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';

// Workaround for testing rate limiters quickly
jest.mock('express-rate-limit', () => ({
  rateLimit: () => (req: any, res: any, next: any) => next()
}));

// Setup db mocks
db.select = jest.fn().mockReturnThis() as any;
db.from = jest.fn().mockReturnThis() as any;
db.where = jest.fn().mockReturnThis() as any;
db.limit = jest.fn().mockReturnThis() as any;
db.insert = jest.fn().mockReturnThis() as any;
db.values = jest.fn().mockReturnThis() as any;
db.returning = jest.fn().mockReturnThis() as any;
db.update = jest.fn().mockReturnThis() as any;
db.set = jest.fn().mockReturnThis() as any;
(db.insert as any).mockImplementation(() => ({
  values: () => ({
    returning: () => [{ id: 'new-token-id' }],
    catch: () => {} // for auditLog catch
  }),
  catch: () => {}
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/portal/auth', portalAuthRoutes);

// Mock quotation route to test transformer and policy
import { CustomerPolicy } from '../src/core/authz/policies/customer.policy.js';
import { toCustomerQuotationDto } from '../src/core/transformers/quotation.transformer.js';
import { authorizeCustomerResource } from '../src/core/authz/helpers.js';

app.get('/api/v1/portal/quotations/:id',
  authenticatePortal,
  authorizeCustomerResource(CustomerPolicy.canViewQuotation),
  (req, res) => {
    // Return transformed data
    const mockInternalQuotation = {
      id: req.params.id,
      title: 'Test Deal',
      amount: 1000,
      status: 'open',
      customerId: 'company-1',
      lastActivityAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'rep-1',
      internalRiskScore: 50,
      margin: 200,
    };
    res.json(toCustomerQuotationDto(mockInternalQuotation));
  }
);
app.use(errorHandler);

describe('Customer Portal Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'supersecret1234567890123456789012';
  });

  it('can request a magic link', async () => {
    (db.limit as jest.Mock).mockResolvedValueOnce([{
      id: 'contact-1',
      email: 'customer@example.com',
      companyId: 'company-1',
    }]);

    const res = await request(app)
      .post('/api/v1/portal/auth/request-link')
      .send({ email: 'customer@example.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/magic link has been sent/);
  });

  it('verifies a magic link token and sets a cookie', async () => {
    (db.limit as jest.Mock).mockResolvedValueOnce([{
      id: 'token-1',
      contactId: 'contact-1',
    }]);
    (db.limit as jest.Mock).mockResolvedValueOnce([{
      id: 'contact-1',
      companyId: 'company-1',
    }]);
    (db.limit as jest.Mock).mockResolvedValueOnce([{
      id: 'company-1',
      name: 'Customer Co',
    }]);

    const res = await request(app)
      .post('/api/v1/portal/auth/verify')
      .send({ token: 'raw-token' });

    expect(res.statusCode).toEqual(200);
    expect(res.headers['set-cookie'][0]).toMatch(/portal_token=/);
  });

  it('fetches authenticated customer and applies data hiding transformer', async () => {
    // Generate valid jwt
    const token = jwt.sign({ contactId: 'contact-1', companyId: 'company-1', type: 'portal' }, process.env.JWT_SECRET!);

    // Mock policy finding the quotation to have companyId = 'company-1'
    (db.limit as jest.Mock).mockResolvedValueOnce([{ customerId: 'company-1' }]);

    const res = await request(app)
      .get('/api/v1/portal/quotations/quote-123')
      .set('Cookie', [`portal_token=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.margin).toBeUndefined(); // internal field hidden
    expect(res.body.ownerId).toBeUndefined(); // internal field hidden
    expect(res.body.title).toEqual('Test Deal');
  });

  it('blocks portal users from accessing internal routes (wrong token type)', async () => {
    // Generate standard jwt (not type: 'portal')
    const token = jwt.sign({ userId: 'user-1', type: 'internal' }, process.env.JWT_SECRET!);

    const res = await request(app)
      .get('/api/v1/portal/auth/me')
      .set('Cookie', [`portal_token=${token}`]);

    expect(res.statusCode).toEqual(401);
  });
});
