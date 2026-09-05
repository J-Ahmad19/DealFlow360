import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { pricingRoutes } from '../src/modules/pricing/pricing.routes.js';
import { PricingService } from '../src/modules/pricing/pricing.service.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';

// Mocking PricingService methods using spyOn
jest.spyOn(PricingService, 'createPriceList');
jest.spyOn(PricingService, 'listPriceLists');

const app = express();
app.use(express.json());

// Mock auth middleware for testing routes
app.use((req, res, next) => {
  (req as any).user = { id: 'user-123', role: 'admin' };
  next();
});

app.use('/pricing', pricingRoutes);
app.use(errorHandler);

describe('Pricing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /pricing/price-lists creates a price list', async () => {
    (PricingService.createPriceList as jest.Mock).mockResolvedValue({ id: 'list-1', name: 'Standard Pricing' } as any);

    const res = await request(app)
      .post('/pricing/price-lists')
      .send({ name: 'Standard Pricing' });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toEqual('Standard Pricing');
  });

  it('GET /pricing/price-lists lists price lists', async () => {
    (PricingService.listPriceLists as jest.Mock).mockResolvedValue([{ id: 'list-1', name: 'Standard Pricing' }] as any);

    const res = await request(app).get('/pricing/price-lists');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
  });
});
