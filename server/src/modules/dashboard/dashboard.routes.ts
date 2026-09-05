import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/stats', DashboardController.getStats);

export const dashboardRoutes = router;
