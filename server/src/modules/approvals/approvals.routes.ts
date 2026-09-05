import { Router } from 'express';
import { ApprovalsController } from './approvals.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

const router = Router();

router.use(authenticate);

router.get(
  '/', 
  requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), 
  ApprovalsController.listQueue
);

router.get(
  '/:id', 
  requireRole(['admin', 'sales_manager', 'finance', 'sales_rep']), 
  ApprovalsController.getDetail
);

router.post(
  '/:id/action', 
  requireRole(['admin', 'sales_manager', 'finance']), 
  ApprovalsController.action
);

export const approvalsRoutes = router;