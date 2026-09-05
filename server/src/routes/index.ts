/**
 * routes/index.ts
 *
 * Central route aggregator.
 * Mount all feature routers here under their versioned prefix.
 * The Express app imports only this file.
 */
import { Router } from 'express';
import healthRouter from './health.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { portalAuthRoutes } from '../modules/portalAuth/portalAuth.routes.js';
import { customersRoutes } from '../modules/customers/customers.routes.js';
import { productsRoutes } from '../modules/products/products.routes.js';
import { pricingRoutes } from '../modules/pricing/pricing.routes.js';
import { approvalRulesRoutes } from '../modules/approvalRules/approvalRules.routes.js';
import { quotationsRoutes } from '../modules/quotations/quotations.routes.js';
import recommendationsRoutes from '../modules/recommendations/recommendations.routes.js';
import fulfillmentRoutes from '../modules/fulfillment/fulfillment.routes.js';
import { ordersRoutes, subscriptionsRoutes, billingRoutes } from '../modules/billing/billing.routes.js';
import { portalRoutes } from '../modules/portal/portal.routes.js';
import { dealHealthRoutes } from '../modules/dealHealth/deal-health.routes.js';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes.js';

const apiRouter = Router();

// ── v1 routes ─────────────────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/portal/auth', portalAuthRoutes);
apiRouter.use('/customers', customersRoutes);
apiRouter.use('/products', productsRoutes);
apiRouter.use('/pricing', pricingRoutes);
apiRouter.use('/approval-rules', approvalRulesRoutes);
apiRouter.use('/quotations', quotationsRoutes);
apiRouter.use('/quotations/:id', recommendationsRoutes);
apiRouter.use('/quotations/:id', fulfillmentRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/subscriptions', subscriptionsRoutes);
apiRouter.use('/portal', portalRoutes);
apiRouter.use('/deal-health', dealHealthRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
// apiRouter.use('/deals', dealsRouter);
// apiRouter.use('/users', usersRouter);

export default apiRouter;
