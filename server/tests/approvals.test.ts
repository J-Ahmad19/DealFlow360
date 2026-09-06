import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { approvalsRoutes } from '../src/modules/approvals/approvals.routes.js';
import { ApprovalsService } from '../src/modules/approvals/approvals.service.js';
import { errorHandler } from '../src/core/middleware/errorHandler.js';

jest.spyOn(ApprovalsService, 'action');

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  (req as any).user = { id: 'user-123', role: 'admin' };
  next();
});
app.use('/approvals', approvalsRoutes);
app.use(errorHandler);

describe('Approvals API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /approvals/:id/action records a reviewer decision', async () => {
    (ApprovalsService.action as jest.Mock).mockResolvedValue({
      quotationId: 'q-123',
      action: 'approve',
      status: 'approved',
      message: 'Approval recorded successfully.',
    });

    const res = await request(app)
      .post('/approvals/q-123/action')
      .send({ action: 'approve', note: 'Margin is within policy.' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.action).toEqual('approve');
    expect(res.body.data.status).toEqual('approved');
  });
});
