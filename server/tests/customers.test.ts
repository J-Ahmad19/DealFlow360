import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { customersRoutes } from '../src/modules/customers/customers.routes.js';
import { CustomersService } from '../src/modules/customers/customers.service.js';
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

// Mocking CustomersService methods using spyOn
jest.spyOn(CustomersService, 'createCompany');
jest.spyOn(CustomersService, 'listCompanies');

const app = express();
app.use(express.json());

app.use('/customers', customersRoutes);
app.use(errorHandler);

describe('Customers API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /customers creates a company', async () => {
    (CustomersService.createCompany as jest.Mock).mockResolvedValue({ id: 'comp-1', name: 'Test Corp' } as any);

    const res = await request(app)
      .post('/customers')
      .send({ name: 'Test Corp' });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.name).toEqual('Test Corp');
  });

  it('GET /customers lists companies', async () => {
    (CustomersService.listCompanies as jest.Mock).mockResolvedValue([{ id: 'comp-1', name: 'Test Corp' }] as any);

    const res = await request(app).get('/customers');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
  });
});
