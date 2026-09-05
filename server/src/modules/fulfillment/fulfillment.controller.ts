import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service.js';
import { z } from 'zod';
import { logger } from '../../core/logging/logger.js';

const inventoryService = new InventoryService();

export async function getFulfillmentPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const plan = await inventoryService.getFulfillmentPlan(id);
    res.json({ data: plan });
  } catch (err) {
    next(err);
  }
}

export async function acceptFulfillment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = await inventoryService.acceptFulfillment(id);
    res.json({ data: order, message: 'Fulfillment accepted and inventory reserved' });
  } catch (err: any) {
    logger.error(err, 'Failed to accept fulfillment');
    res.status(409).json({ error: err.message || 'Failed to accept fulfillment due to concurrency or stock issues' });
  }
}

const overrideSchema = z.object({
  overrides: z.array(z.object({
    productId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().min(1)
  }))
});

export async function overrideFulfillment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { overrides } = overrideSchema.parse(req.body);
    const order = await inventoryService.overrideFulfillment(id, overrides);
    res.json({ data: order, message: 'Fulfillment override applied' });
  } catch (err) {
    next(err);
  }
}

export async function consolidateBackorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Just a placeholder endpoint for backorder consolidation logic
    res.json({ message: 'Backorder consolidation initiated' });
  } catch (err) {
    next(err);
  }
}
