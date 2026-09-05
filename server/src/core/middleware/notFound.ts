/**
 * core/middleware/notFound.ts
 *
 * 404 handler — must be registered AFTER all real routes.
 * Produces a consistent ApiError envelope.
 */
import type { Request, Response } from 'express';
import { sendError } from '../http/response.js';

export function notFound(req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
}
