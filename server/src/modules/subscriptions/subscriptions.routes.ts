import { Router } from 'express';
import { SubscriptionsController } from './subscriptions.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

const router = Router();
router.use(authenticate);

const allowedRoles = ['admin', 'finance', 'sales_rep'];

router.get('/', requireRole(allowedRoles as any), SubscriptionsController.getDashboard);
router.get('/:id', requireRole(allowedRoles as any), SubscriptionsController.getDetail);

export const subscriptionsRoutes = router;