import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../cache/redis.client.js';
import { CacheKey, TTL } from '../cache/cache.keys.js';

interface CachedResponse {
  statusCode: number;
  body: any;
}

/**
 * idempotencyMiddleware
 *
 * Middleware that checks for an idempotency key passed via:
 *   - Header `X-Idempotency-Key` or `Idempotency-Key`
 *   - Request body `idempotencyKey`
 *
 * If the key has already been processed within the 24h window:
 *   Returns the exact cached response (status & payload) without re-executing logic.
 *
 * If it is new:
 *   Interceptors save the completed response into Redis upon completion.
 */
export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key =
    (req.headers['x-idempotency-key'] as string) ||
    (req.headers['idempotency-key'] as string) ||
    (req.body && req.body.idempotencyKey);

  if (!key) {
    return next();
  }

  const client = getRedisClient();
  if (!client) {
    return next();
  }

  const redisKey = CacheKey.idempotency(key);

  try {
    const cached = await client.get<CachedResponse>(redisKey);
    if (cached) {
      res.setHeader('X-Idempotency-Replay', 'true');
      res.status(cached.statusCode).json(cached.body);
      return;
    }
  } catch (err) {
    console.warn(`[Idempotency Middleware GET Error] Key "${key}":`, err);
  }

  // Intercept res.json to capture response
  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      client.set(redisKey, JSON.stringify({ statusCode: res.statusCode, body }), { ex: TTL.IDEMPOTENCY })
        .catch((err) => console.warn(`[Idempotency Middleware SET Error] Key "${key}":`, err));
    }
    return originalJson(body);
  };

  next();
}
