import { Request, Response } from 'express';
import { z } from 'zod';
import { SubscriptionsService } from './subscriptions.service.js';

export const SubscriptionsController = {
  create: async (req: Request, res: Response) => {
    try {
      const payload = z.object({
        customerId: z.string().uuid(),
        productId: z.string().uuid(),
        interval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
      }).parse(req.body);

      const data = await SubscriptionsService.create(payload);
      res.status(201).json({ data, message: 'Subscription created successfully' });
    } catch (err: any) {
      res.status(400).json({ error: { message: err?.message || 'Unable to create subscription' } });
    }
  },

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