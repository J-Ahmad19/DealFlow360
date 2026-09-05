import { Router } from 'express';
import { createOrder, getOrder, getOrderBilling, processPayment, modifySubscription, cancelSubscription } from './billing.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { idempotencyMiddleware } from '../../core/middleware/idempotency.js';

export const ordersRoutes = Router();
ordersRoutes.use(authenticate);

ordersRoutes.post('/', createOrder);
ordersRoutes.get('/:id', getOrder);
ordersRoutes.get('/:id/billing', getOrderBilling);
ordersRoutes.post('/:id/payment', idempotencyMiddleware, processPayment);

export const subscriptionsRoutes = Router();
subscriptionsRoutes.use(authenticate);

subscriptionsRoutes.post('/:id/modify', idempotencyMiddleware, modifySubscription);
subscriptionsRoutes.post('/:id/cancel', idempotencyMiddleware, cancelSubscription);
