import { Router } from 'express';
import { QuotationsController } from './quotations.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { requireRole } from '../../core/middleware/requireRole.js';

const router = Router();

router.use(authenticate);

// Sales reps and above can manage quotations
router.post('/', requireRole(['sales_rep', 'sales_manager', 'admin']), QuotationsController.create);
router.get('/', requireRole(['sales_rep', 'sales_manager', 'admin']), QuotationsController.list);
router.get('/:id', requireRole(['sales_rep', 'sales_manager', 'admin']), QuotationsController.get);
router.patch('/:id', requireRole(['sales_rep', 'sales_manager', 'admin']), QuotationsController.update);

// State transitions
router.post('/:id/submit', requireRole(['sales_rep', 'sales_manager', 'admin']), QuotationsController.submit);
router.post('/:id/revise', requireRole(['sales_manager', 'admin']), QuotationsController.revise);

export const quotationsRoutes = router;
