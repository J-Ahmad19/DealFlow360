import { Router } from 'express';
import { PortalAuthController } from './portalAuth.controller.js';
import { portalAuthLimiter } from '../../core/middleware/rateLimiter.js';
import { authenticatePortal } from '../../core/middleware/authenticatePortal.js';

const router = Router();

router.post('/signup', portalAuthLimiter, PortalAuthController.signup);
router.post('/request-link', portalAuthLimiter, PortalAuthController.requestLink);
router.post('/verify', PortalAuthController.verify);
router.post('/logout', authenticatePortal, PortalAuthController.logout);
router.get('/me', authenticatePortal, PortalAuthController.getMe);

export { router as portalAuthRoutes };
