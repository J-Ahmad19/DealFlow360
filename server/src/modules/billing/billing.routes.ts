import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getOrderBilling,
  processPayment,
  modifySubscription,
  cancelSubscription,
  listInvoices,
  getInvoice,
} from './billing.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { idempotencyMiddleware } from '../../core/middleware/idempotency.js';

export const ordersRoutes = Router();
ordersRoutes.use(authenticate);

ordersRoutes.post('/', createOrder);
ordersRoutes.get('/:id', getOrder);
ordersRoutes.get('/:id/billing', getOrderBilling);
ordersRoutes.post('/:id/payment', idempotencyMiddleware, processPayment);

export const billingRoutes = Router();
billingRoutes.use(authenticate);

billingRoutes.get('/invoices', listInvoices);
billingRoutes.get('/invoices/:id', getInvoice);

export const subscriptionsRoutes = Router();
subscriptionsRoutes.use(authenticate);

subscriptionsRoutes.post('/:id/modify', idempotencyMiddleware, modifySubscription);
subscriptionsRoutes.post('/:id/cancel', idempotencyMiddleware, cancelSubscription);
