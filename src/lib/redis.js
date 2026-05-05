import { Redis } from '@upstash/redis';

// ============================================
// 🔴 REDIS CLIENT (Upstash Serverless)
// Ultra-fast caching layer for frequently accessed data
// ============================================

let redis = null;

/**
 * Get or create a singleton Redis client.
 * Falls back gracefully if env vars are missing (dev mode without Redis).
 */
export function getRedis() {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('⚠️ Redis: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Caching disabled.');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}
