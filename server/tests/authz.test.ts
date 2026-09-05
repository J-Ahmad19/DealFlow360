import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { authorize, authorizeResource } from '../src/core/authz/helpers.js';
import { Permissions } from '../src/core/authz/permissions.js';
import { QuotationPolicy } from '../src/core/authz/policies/quotation.policy.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';

import { db } from '../src/db/client.js';

// Setup db mocks directly on the imported object (works around ESM mock issues)
db.query = {
  quotations: {
    findFirst: jest.fn(),
  },
  approvals: {
    findFirst: jest.fn(),
  }
} as any;

// --- Setup App ---
const app = express();
app.use(express.json());

// Mock Auth Middleware to inject user
const injectUser = (user: any) => (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = user;
  next();
};

app.post('/quotations', 
  injectUser({ id: 'user-123', role: 'sales_rep', status: 'active' }),
  authorize(Permissions.QUOTATION_CREATE),
  (req, res) => res.status(200).json({ ok: true })
);

app.post('/admin-only',
  injectUser({ id: 'user-123', role: 'sales_rep', status: 'active' }),
  authorize(Permissions.USER_MANAGEMENT),
  (req, res) => res.status(200).json({ ok: true })
);

app.patch('/quotations/:id',
  (req, res, next) => {
    // dynamically inject based on header
    (req as any).user = { id: req.headers['x-user-id'], role: req.headers['x-user-role'], status: 'active' };
    next();
  },
  authorizeResource(QuotationPolicy.canEdit),
  (req, res) => res.status(200).json({ ok: true })
);

app.post('/quotations/:id/approve',
  (req, res, next) => {
    (req as any).user = { id: req.headers['x-user-id'], role: req.headers['x-user-role'], status: 'active' };
    next();
  },
  authorizeResource(QuotationPolicy.canApprove),
  (req, res) => res.status(200).json({ ok: true })
);

app.use(errorHandler);

// --- Tests ---
describe('Authorization Middleware', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    (db.query.quotations.findFirst as jest.Mock).mockResolvedValue({ ownerId: 'user-123' });
    (db.query.approvals.findFirst as jest.Mock).mockResolvedValue({ id: 'app-1', approverRole: 'sales_manager' });
  });

  it('allows access when user has correct role permission (allowed access)', async () => {
    const res = await request(app).post('/quotations');
    expect(res.statusCode).toEqual(200);
  });

  it('denies access when user lacks role permission (denied access)', async () => {
    const res = await request(app).post('/admin-only');
    expect(res.statusCode).toEqual(403);
    expect(res.body.error.message).toMatch(/Insufficient permissions/);
  });

  describe('Resource Policies (ABAC)', () => {
    it('allows edit when user is owner', async () => {
      // db.query.quotations.findFirst returns ownerId: 'user-123'
      const res = await request(app)
        .patch('/quotations/quote-123')
        .set('x-user-id', 'user-123')
        .set('x-user-role', 'sales_rep');
        
      expect(res.statusCode).toEqual(200);
    });

    it('denies edit when user is NOT owner (ownership violation)', async () => {
      // db.query.quotations.findFirst returns ownerId: 'user-123'
      const res = await request(app)
        .patch('/quotations/quote-123')
        .set('x-user-id', 'user-999') // different user
        .set('x-user-role', 'sales_rep');
        
      expect(res.statusCode).toEqual(403);
      expect(res.body.error.message).toMatch(/permission/);
    });

    it('denies approval when user has wrong approval role (wrong approval role)', async () => {
      // Mock the approval step finding NO matching pending approval for this role
      (db.query.approvals.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/quotations/quote-123/approve')
        .set('x-user-id', 'finance-user-1')
        .set('x-user-role', 'finance'); // Suppose the step requires sales_manager
        
      expect(res.statusCode).toEqual(403);
    });

    it('allows approval when user has matching approval role', async () => {
      // Mock finding the pending step
      (db.query.approvals.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'app-1', approverRole: 'sales_manager' });

      const res = await request(app)
        .post('/quotations/quote-123/approve')
        .set('x-user-id', 'manager-1')
        .set('x-user-role', 'sales_manager');
        
      expect(res.statusCode).toEqual(200);
    });
  });
});
