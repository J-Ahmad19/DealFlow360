import { Router } from 'express';
import { QuotationsController } from './quotations.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router();
router.use(authenticate);

// CRUD Operations
router.post('/', QuotationsController.create);
router.get('/', QuotationsController.list);
router.get('/:id', QuotationsController.get);
router.patch('/:id', QuotationsController.update);

// State Machine Actions
router.post('/:id/submit', QuotationsController.submit);
router.post('/:id/revise', QuotationsController.revise);
router.patch('/:id/status', QuotationsController.changeStatus); // Drag and drop endpoint

export const quotationsRoutes = router;