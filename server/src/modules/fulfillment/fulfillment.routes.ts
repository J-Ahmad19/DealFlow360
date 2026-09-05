import { Router } from 'express';
import { FulfillmentController } from './fulfillment.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router();
router.use(authenticate);

// These map perfectly to apiFetch('/fulfillment') and apiFetch('/fulfillment/:id')
router.get('/', FulfillmentController.getDashboard);
router.get('/:id', FulfillmentController.getDetail);
router.post('/:id/accept', FulfillmentController.accept);

export const fulfillmentRoutes = router;
export default router;