import { Router } from 'express';
import { listQuotations, getQuotation, addMessage, counterOffer, confirmQuotation } from './portal.controller.js';
import { negotiationRateLimiter } from '../../core/middleware/rateLimiter.js';
import { authenticatePortal } from '../../core/middleware/authenticatePortal.js';

export const portalRoutes = Router();

portalRoutes.use(authenticatePortal);
portalRoutes.get('/quotations', listQuotations);
portalRoutes.get('/quotations/:id', getQuotation);
portalRoutes.post('/quotations/:id/messages', negotiationRateLimiter, addMessage);
portalRoutes.post('/quotations/:id/counter-offer', negotiationRateLimiter, counterOffer);
portalRoutes.post('/quotations/:id/confirm', negotiationRateLimiter, confirmQuotation);
