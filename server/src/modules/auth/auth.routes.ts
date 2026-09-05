import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { loginRateLimiter } from '../../core/middleware/rateLimiter.js';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', authenticate, AuthController.refresh);
router.get('/me', authenticate, AuthController.me);

export { router as authRoutes };
