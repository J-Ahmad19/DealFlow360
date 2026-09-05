/**
 * routes/index.ts
 *
 * Central route aggregator.
 * Mount all feature routers here under their versioned prefix.
 * The Express app imports only this file.
 */
import { Router } from 'express';
import healthRouter from './health.js';

const apiRouter = Router();

// ── v1 routes ─────────────────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);

// Future modules — uncomment as they are implemented:
// apiRouter.use('/auth',  authRouter);
// apiRouter.use('/deals', dealsRouter);
// apiRouter.use('/users', usersRouter);

export default apiRouter;
