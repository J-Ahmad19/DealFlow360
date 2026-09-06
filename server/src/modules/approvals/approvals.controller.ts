import { Request, Response } from 'express';
import { ApprovalsService } from './approvals.service.js';

export const ApprovalsController = {
  listQueue: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const approvals = await ApprovalsService.getApprovalQueue(user.id, user.role);
      res.json(approvals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
  
  // 👉 Make sure this exists!
  getDetail: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const detail = await ApprovalsService.getApprovalDetail(req.params.id, user.id, user.role);
      
      if (!detail) {
        return res.status(404).json({ error: 'Approval request not found' });
      }
      res.json(detail);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  },

  action: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const action = String(req.body.action || '').toLowerCase();
      const note = String(req.body.note || '').trim();

      if (!['approve', 'reject', 'revise'].includes(action)) {
        return res.status(400).json({ error: 'Invalid approval action.' });
      }

      const result = await ApprovalsService.action(req.params.id, user.id, user.role, action, note);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
};