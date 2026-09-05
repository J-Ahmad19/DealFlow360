import { Request, Response } from 'express';
import { SubscriptionsService } from './subscriptions.service.js';

export const SubscriptionsController = {
  getDashboard: async (req: Request, res: Response) => {
    try {
      const data = await SubscriptionsService.getDashboard();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getDetail: async (req: Request, res: Response) => {
    try {
      const data = await SubscriptionsService.getDetail(req.params.id);
      if (!data) return res.status(404).json({ error: 'Subscription not found' });
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};