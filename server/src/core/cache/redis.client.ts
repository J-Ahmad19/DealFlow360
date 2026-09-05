import { Redis } from '@upstash/redis';
import { config } from '../../config/index.js';

/**
 * redis.client.ts
 *
 * Upstash Redis Singleton & Cache Utilities.
 *
 * Design Guarantees:
 *  1. Non-authoritative — Redis is ONLY a performance cache.
 *  2. Graceful degradation — If REDIS_URL is empty or Upstash fails,
 *     every helper falls back to calling the database transparently.
 *  3. Silent error swallowing — Redis write/read errors are logged but
 *     never throw to caller operations.
 */

let redisInstance: Redis | null = null;
let isConfigured = false;

function initRedis(): Redis | null {
  if (isConfigured) return redisInstance;

  const url = config.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = config.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      redisInstance = new Redis({ url, token });
      isConfigured = true;
      console.log('⚡ Upstash Redis client initialized');
    } catch (err) {
      console.warn('⚠️ Failed to initialize Upstash Redis, proceeding without cache:', err);
      redisInstance = null;
      isConfigured = true;
    }
  } else {
    console.log('ℹ️ Redis URL/Token not provided. Running in cache-disabled mode.');
    redisInstance = null;
    isConfigured = true;
  }

  return redisInstance;
}

export function getRedisClient(): Redis | null {
  return initRedis();
}

export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}

/**
 * Executes fetcher with Redis cache wrapper.
 * On cache hit -> returns cached item.
 * On cache miss or Redis error -> executes fetcher, caches result in background, returns result.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const client = getRedisClient();

  if (!client) {
    return fetcher();
  }

  try {
    const cached = await client.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[Redis Cache GET Error] Key "${key}":`, err);
  }

  // Cache miss or read error — call database/fetcher
  const result = await fetcher();

  if (result !== undefined && result !== null) {
    try {
      await client.set(key, JSON.stringify(result), { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[Redis Cache SET Error] Key "${key}":`, err);
    }
  }

  return result;
}

/**
 * Invalidates single or multiple cache keys.
 */
export async function invalidateCache(keyOrKeys: string | string[]): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  if (keys.length === 0) return;

  try {
    await client.del(...keys);
  } catch (err) {
    console.warn(`[Redis Invalidate Error] Keys [${keys.join(', ')}]:`, err);
  }
}

/**
 * Invalidates all keys matching a pattern (e.g. "dealflow:pricing:*").
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  } catch (err) {
    console.warn(`[Redis Invalidate Pattern Error] Pattern "${pattern}":`, err);
  }
}
