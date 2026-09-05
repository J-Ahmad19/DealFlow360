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

const apiRouter = Router();

// ── v1 routes ─────────────────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRoutes);
// apiRouter.use('/deals', dealsRouter);
// apiRouter.use('/users', usersRouter);

export default apiRouter;
