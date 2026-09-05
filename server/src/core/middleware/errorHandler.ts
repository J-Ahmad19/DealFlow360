/**
 * core/middleware/errorHandler.ts
 *
 * Centralized Express error handler.
 * - Operational AppErrors → structured ApiError JSON response
 * - Unexpected errors    → generic 500, full stack logged
 *
 * Must be registered as the LAST middleware in the chain (4-arg signature).
 */
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { sendError } from '../http/response.js';
import { logger } from '../logging/logger.js';
import { config } from '../../config/index.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    // Known, safe-to-expose error
    logger.warn({ err, path: req.path }, err.message);
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // Unexpected error — log full details, hide internals from client
  logger.error({ err, path: req.path }, 'Unhandled error');
  sendError(
    res,
    'INTERNAL_ERROR',
    config.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : (err instanceof Error ? err.message : 'Unknown error'),
    500,
  );
}
