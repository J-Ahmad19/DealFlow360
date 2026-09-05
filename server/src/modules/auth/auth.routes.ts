import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// 10. Add rate limiting to login.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', AuthController.signup);
router.post('/login', loginLimiter, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', authenticate, AuthController.refresh);
router.get('/me', authenticate, AuthController.me);

export { router as authRoutes };
