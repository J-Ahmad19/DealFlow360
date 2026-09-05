/**
 * routes/health.ts
 *
 * GET /api/v1/health
 *
 * Returns the live status of the server and its critical dependencies.
 * Designed to be used by load balancers, uptime monitors, and Kubernetes
 * readiness probes. Returns 200 when healthy, 503 when degraded.
 */
import { Router, type Request, type Response } from 'express';
import { checkDbConnection } from '../db/client.js';
import { sendSuccess, sendError } from '../core/http/response.js';
import { config } from '../config/index.js';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded';
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error';
  };
}

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const dbOk = await checkDbConnection().catch(() => false);

  const status: HealthStatus = {
    status: dbOk ? 'healthy' : 'degraded',
    version: process.env['npm_package_version'] ?? '0.1.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: {
      database: dbOk ? 'ok' : 'error',
    },
  };

  if (status.status === 'healthy') {
    sendSuccess(res, status, 200);
  } else {
    sendError(res, 'SERVICE_DEGRADED', 'One or more checks failed', 503, status.checks);
  }
});

export default router;
