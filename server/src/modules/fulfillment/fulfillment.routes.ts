import { Router } from 'express';
import { getFulfillmentPlan, acceptFulfillment, overrideFulfillment, consolidateBackorder } from './fulfillment.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/fulfillment', getFulfillmentPlan);
router.post('/fulfillment/accept', acceptFulfillment);
router.post('/fulfillment/override', overrideFulfillment);
router.post('/backorder/consolidate', consolidateBackorder);

export default router;
