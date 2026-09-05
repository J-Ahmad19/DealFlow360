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
    res.json({ success: true, message: `Action ${req.body.action} recorded.` });
  }
};