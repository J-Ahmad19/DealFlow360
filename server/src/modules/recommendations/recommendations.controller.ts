import { Request, Response, NextFunction } from 'express';
import { RecommendationEngine } from './recommendation.engine.js';
import { logger } from '../../core/logging/logger.js';
import { z } from 'zod';

const engine = new RecommendationEngine();

const getRecommendationsQuerySchema = z.object({
  marginThreshold: z.string().optional().default('10'), // default 10%
});

export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: quotationId } = req.params;
    const { marginThreshold } = getRecommendationsQuerySchema.parse(req.query);

    const threshold = parseInt(marginThreshold, 10);
    
    if (isNaN(threshold)) {
      res.status(400).json({ error: 'Invalid marginThreshold' });
      return;
    }

    const recommendations = await engine.getRecommendations(quotationId, threshold);
    
    logger.info({ quotationId, count: recommendations.length }, 'Generated recommendations');
    
    res.json({
      data: recommendations,
      meta: {
        total: recommendations.length,
      }
    });
  } catch (error) {
    next(error);
  }
}
