import { Request, Response } from 'express';
import { FulfillmentService } from './fulfillment.service.js';

const service = new FulfillmentService();

export const FulfillmentController = {
  getDashboard: async (req: Request, res: Response) => {
    try {
      const data = await service.getDashboard();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
  
  getDetail: async (req: Request, res: Response) => {
    try {
      const detail = await service.getFulfillmentPlan(req.params.id);
      if (!detail) return res.status(404).json({ error: 'Order not found' });
      res.json(detail);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  accept: async (req: Request, res: Response) => {
    try {
      await service.acceptFulfillment(req.params.id);
      res.json({ success: true, message: 'Fulfillment successfully locked and processed.' });
    } catch (err: any) {
      res.status(409).json({ error: err.message }); // 409 Conflict for concurrency errors
    }
  }
};