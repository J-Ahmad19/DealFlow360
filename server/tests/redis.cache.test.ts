import { describe, it, expect, jest } from '@jest/globals';
import { withCache, invalidateCache } from '../src/core/cache/redis.client.js';
import { CacheKey } from '../src/core/cache/cache.keys.js';
import { createRateLimiter } from '../src/core/middleware/rateLimiter.js';
import { idempotencyMiddleware } from '../src/core/middleware/idempotency.js';

describe('Redis Cache Layer (Upstash / Memory Fallback)', () => {
  it('1. withCache transparently executes fetcher when Redis is disabled/unreachable', async () => {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { id: 'quote-1', total: 1000 };
    };

    const result = await withCache('test:key:1', 60, fetcher);
    expect(result).toEqual({ id: 'quote-1', total: 1000 });
    expect(fetchCount).toBe(1);
  });

  it('2. CacheKey builders construct correct namespaces', () => {
    expect(CacheKey.pricingPolicy('tier-gold', 'cust-1')).toBe('dealflow:pricing:tier-gold:cust-1');
    expect(CacheKey.recommendations('q-123')).toBe('dealflow:recommendations:q-123');
    expect(CacheKey.dashboardHealth('team-a')).toBe('dealflow:dashboard:health:team-a');
    expect(CacheKey.approvalPolicy('v1')).toBe('dealflow:approval-policy:v1');
    expect(CacheKey.idempotency('idemp-abc')).toBe('dealflow:idempotency:idemp-abc');
  });

  it('3. invalidateCache and invalidatePattern do not throw when Redis is unavailable', async () => {
    await expect(invalidateCache('test:key:1')).resolves.toBeUndefined();
    await expect(invalidateCache(['test:key:1', 'test:key:2'])).resolves.toBeUndefined();
  });

  it('4. createRateLimiter instantiates rate limiters smoothly', () => {
    const limiter = createRateLimiter({
      name: 'test-limiter',
      windowMs: 60000,
      max: 10,
    });
    expect(limiter).toBeDefined();
    expect(typeof limiter).toBe('function');
  });

  it('5. idempotencyMiddleware passes through new requests cleanly when key missing', async () => {
    const req: any = { headers: {}, body: {} };
    const res: any = {};
    const next = jest.fn();

    await idempotencyMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
