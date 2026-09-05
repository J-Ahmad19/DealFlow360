/**
 * core/http/response.ts
 *
 * Typed response envelope helpers.
 * Every API response uses one of these shapes so clients have a
 * consistent, predictable contract.
 *
 * Success:  { success: true,  data: T,   meta?: M }
 * Error:    { success: false, error: { code, message, details? } }
 */
import type { Response } from 'express';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T, M = undefined> {
  success: true;
  data: T;
  meta?: M;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T, M = undefined> = ApiSuccess<T, M> | ApiError;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sendSuccess<T, M = undefined>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: M,
): void {
  const body: ApiSuccess<T, M> = { success: true, data, ...(meta !== undefined && { meta }) };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown,
): void {
  const body: ApiError = {
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
  };
  res.status(statusCode).json(body);
}
