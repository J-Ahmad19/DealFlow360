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
  getSubscription, // Added the missing import for the detail page
} from './billing.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { idempotencyMiddleware } from '../../core/middleware/idempotency.js';

// ─── Orders Routes ───────────────────────────────────────────────────────────
export const ordersRoutes = Router({ mergeParams: true });
ordersRoutes.use(authenticate);

ordersRoutes.post('/', createOrder);
ordersRoutes.get('/:id', getOrder);
ordersRoutes.get('/:id/billing', getOrderBilling);
ordersRoutes.post('/:id/payment', idempotencyMiddleware, processPayment);

// ─── Billing (Invoices) Routes ───────────────────────────────────────────────
export const billingRoutes = Router({ mergeParams: true });
billingRoutes.use(authenticate);

billingRoutes.get('/invoices', listInvoices);
billingRoutes.get('/invoices/:id', getInvoice);

// ─── Subscriptions Routes ────────────────────────────────────────────────────
export const subscriptionsRoutes = Router({ mergeParams: true });
subscriptionsRoutes.use(authenticate);

// The GET route required for the SubscriptionDetail.tsx frontend component
subscriptionsRoutes.get('/:id', getSubscription); 

// The robust, idempotency-protected POST routes for state changes
subscriptionsRoutes.post('/:id/modify', idempotencyMiddleware, modifySubscription);
subscriptionsRoutes.post('/:id/cancel', idempotencyMiddleware, cancelSubscription);