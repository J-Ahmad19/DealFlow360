import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { subscriptionsRoutes } from '../src/modules/subscriptions/subscriptions.routes.js';
import { SubscriptionsService } from '../src/modules/subscriptions/subscriptions.service.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';

jest.mock('../src/core/middleware/authenticate.js', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', role: 'admin' };
    next();
  }
}));

jest.mock('../src/core/middleware/requireRole.js', () => ({
  requireRole: () => (req: any, res: any, next: any) => next()
}));

jest.spyOn(SubscriptionsService, 'create');

const app = express();
app.use(express.json());
app.use('/subscriptions', subscriptionsRoutes);
app.use(errorHandler);

describe('Subscriptions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /subscriptions creates a subscription', async () => {
    (SubscriptionsService.create as jest.Mock).mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      interval: 'monthly',
    });

    const res = await request(app)
      .post('/subscriptions')
      .send({
        customerId: 'c2a7f8f3-0d9c-4d93-96e4-857a876f1a20',
        productId: 'd7b8a94f-456e-4973-b20c-4c5cf1ad4b0d',
        interval: 'monthly',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.status).toEqual('active');
  });
});
