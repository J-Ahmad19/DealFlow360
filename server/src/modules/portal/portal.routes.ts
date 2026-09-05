import { Router } from 'express';
import { getQuotation, addMessage, counterOffer, confirmQuotation } from './portal.controller.js';
import { negotiationRateLimiter } from '../../core/middleware/rateLimiter.js';

export const portalRoutes = Router();

// In a real application, you would add a specific authentication middleware for customers here.
// e.g., portalRoutes.use(authenticateCustomer);

portalRoutes.get('/quotations/:id', getQuotation);
portalRoutes.post('/quotations/:id/messages', negotiationRateLimiter, addMessage);
portalRoutes.post('/quotations/:id/counter-offer', negotiationRateLimiter, counterOffer);
portalRoutes.post('/quotations/:id/confirm', negotiationRateLimiter, confirmQuotation);
