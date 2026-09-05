import { Router } from 'express';
import { PortalAuthController } from './portalAuth.controller.js';
import { rateLimit } from 'express-rate-limit';
import { authenticatePortal } from '../../core/middleware/authenticatePortal.js';

const router = Router();

// Rate limit request link to prevent spam
const requestLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: { message: 'Too many requests, please try again later.' } }
});

router.post('/request-link', requestLinkLimiter, PortalAuthController.requestLink);
router.post('/verify', PortalAuthController.verify);
router.post('/logout', authenticatePortal, PortalAuthController.logout);
router.get('/me', authenticatePortal, PortalAuthController.getMe);

export { router as portalAuthRoutes };
