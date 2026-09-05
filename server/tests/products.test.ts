import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { productsRoutes } from '../src/modules/products/products.routes.js';
import { ProductsService } from '../src/modules/products/products.service.js';
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

// Mocking ProductsService methods using spyOn
jest.spyOn(ProductsService, 'createProduct');
jest.spyOn(ProductsService, 'listProducts');
jest.spyOn(ProductsService, 'getProduct');
jest.spyOn(ProductsService, 'updateProduct');
jest.spyOn(ProductsService, 'createCategory');
jest.spyOn(ProductsService, 'listCategories');
jest.spyOn(ProductsService, 'updateCategory');

const app = express();
app.use(express.json());

app.use('/products', productsRoutes);
app.use(errorHandler);

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /products creates a product', async () => {
    (ProductsService.createProduct as jest.Mock).mockResolvedValue({ id: 'prod-1', name: 'Software License' } as any);

    const res = await request(app)
      .post('/products')
      .send({ name: 'Software License', price: 5000 });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toEqual('Software License');
  });

  it('GET /products lists products', async () => {
    (ProductsService.listProducts as jest.Mock).mockResolvedValue([{ id: 'prod-1', name: 'Software License' }] as any);

    const res = await request(app).get('/products');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
  });
});
