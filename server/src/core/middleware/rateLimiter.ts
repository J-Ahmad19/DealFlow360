import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../cache/redis.client.js';

/**
 * rateLimiter.ts
 *
 * Factory for Redis-backed rate limiters using express-rate-limit and rate-limit-redis.
 * Gracefully falls back to MemoryStore if Redis is unavailable.
 */

export interface CreateLimiterOptions {
  /** Identifier prefix in Redis: dealflow:rate:{name}:{ip} */
  name: string;
  /** Window size in milliseconds */
  windowMs: number;
  /** Max allowed requests per window */
  max: number;
  /** Custom error message */
  message?: string;
}

export function createRateLimiter(options: CreateLimiterOptions) {
  const client = getRedisClient();
  const redisClientSupportsLegacyCommandApi =
    !!client && typeof (client as { call?: (...args: unknown[]) => unknown }).call === 'function';

  const store = redisClientSupportsLegacyCommandApi
    ? new RedisStore({
        sendCommand: async (...args: string[]) => {
          const [command, ...rest] = args;
          return (client as any).call(command, ...rest);
        },
        prefix: `dealflow:rate:${options.name}:`,
      })
    : undefined;

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: options.message || 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    store,
  });
}

// ─── Pre-configured Limiters ──────────────────────────────────────────────────

/** Login rate limiter: 5 attempts per 15 min */
export const loginRateLimiter = createRateLimiter({
  name: 'login',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.',
});

/** Portal Auth link request rate limiter: 5 attempts per 15 min */
export const portalAuthLimiter = createRateLimiter({
  name: 'portal-auth',
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many auth link requests, please try again after 15 minutes.',
});

/** Portal negotiation rate limiter (counter-offer / messages): 10 per 15 min */
export const negotiationRateLimiter = createRateLimiter({
  name: 'negotiation',
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many negotiation requests submitted. Please wait a few minutes.',
});

/** Approval submission/action rate limiter: 20 per 15 min */
export const approvalRateLimiter = createRateLimiter({
  name: 'approval',
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many approval actions submitted. Please wait before retrying.',
});
