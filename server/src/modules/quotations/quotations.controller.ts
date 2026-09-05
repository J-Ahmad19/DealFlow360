import { Request, Response } from 'express';
import { QuotationsService, QuotationError } from './quotations.service.js';
import { createQuotationSchema, updateQuotationSchema } from './quotations.types.js';

export const QuotationsController = {
  create: async (req: Request, res: Response) => {
    try {
      const data = createQuotationSchema.parse(req.body);
      // user should be set by authenticate middleware
      const actorId = (req as any).user.id;
      const quotation = await QuotationsService.createQuotation(data, actorId);
      res.status(201).json(quotation);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ error: err.errors });
      }
      if (err instanceof QuotationError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  list: async (req: Request, res: Response) => {
    try {
      const quotations = await QuotationsService.listQuotations();
      res.json(quotations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  get: async (req: Request, res: Response) => {
    try {
      const quotation = await QuotationsService.getQuotation(req.params.id);
      if (!quotation) {
        return res.status(404).json({ error: 'Quotation not found' });
      }
      res.json(quotation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const data = updateQuotationSchema.parse(req.body);
      const actorId = (req as any).user.id;
      const quotation = await QuotationsService.updateQuotation(req.params.id, data, actorId);
      res.json(quotation);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ error: err.errors });
      }
      if (err instanceof QuotationError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  submit: async (req: Request, res: Response) => {
    try {
      const actorId = (req as any).user.id;
      const quotation = await QuotationsService.changeStatus(req.params.id, 'pending_approval', actorId);
      res.json(quotation);
    } catch (err: any) {
      if (err instanceof QuotationError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  revise: async (req: Request, res: Response) => {
    try {
      const actorId = (req as any).user.id;
      const quotation = await QuotationsService.changeStatus(req.params.id, 'revision_required', actorId);
      res.json(quotation);
    } catch (err: any) {
      if (err instanceof QuotationError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },
};
