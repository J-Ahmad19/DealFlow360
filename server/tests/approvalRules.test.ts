import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { approvalRulesRoutes } from '../src/modules/approvalRules/approvalRules.routes.js';
import { ApprovalRulesService } from '../src/modules/approvalRules/approvalRules.service.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';

// Mocking ApprovalRulesService methods using spyOn
jest.spyOn(ApprovalRulesService, 'createRule');
jest.spyOn(ApprovalRulesService, 'listRules');

const app = express();
app.use(express.json());

// Mock auth middleware for testing routes
app.use((req, res, next) => {
  (req as any).user = { id: 'user-123', role: 'admin' };
  next();
});

app.use('/approval-rules', approvalRulesRoutes);
app.use(errorHandler);

describe('Approval Rules API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /approval-rules creates a rule', async () => {
    (ApprovalRulesService.createRule as jest.Mock).mockResolvedValue({ id: 'rule-1', approverRole: 'finance' } as any);

    const res = await request(app)
      .post('/approval-rules')
      .send({ maxRisk: 50, approverRole: 'finance', sequence: 1 });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.data.approverRole).toEqual('finance');
  });

  it('GET /approval-rules lists rules', async () => {
    (ApprovalRulesService.listRules as jest.Mock).mockResolvedValue([{ id: 'rule-1', approverRole: 'finance' }] as any);

    const res = await request(app).get('/approval-rules');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveLength(1);
  });
});
