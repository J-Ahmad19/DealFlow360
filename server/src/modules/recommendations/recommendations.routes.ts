import { Router } from 'express';
import { getRecommendations } from './recommendations.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router({ mergeParams: true });

// Mounted under /api/v1/quotations/:id
router.get('/recommendations', authenticate, getRecommendations);

export default router;
