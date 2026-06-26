import { Redis } from '@upstash/redis';

// ============================================
// 🔴 REDIS CLIENT (Upstash Serverless)
// Ultra-fast caching layer for frequently accessed data
// ============================================

let redis = null;
let isHealthy = true;
let lastCheckTime = 0;
const HEALTH_CHECK_COOLDOWN = 60000; // 1 minute

/**
 * Get or create a singleton Redis client.
 * Falls back gracefully if env vars are missing (dev mode without Redis).
 */
export function getRedis() {
  if (!isHealthy) {
    const now = Date.now();
    if (now - lastCheckTime < HEALTH_CHECK_COOLDOWN) {
      return null; // Skip Redis during cooldown to avoid latency
    }
    isHealthy = true; // Cooldown elapsed, try again
  }

  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('⚠️ Redis: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Caching disabled.');
    return null;
  }

  redis = new Redis({
    url,
    token,
    retry: false, // Disable retries to fail fast (avoiding 5x timeout latency)
    fetch: (input, init) => {
      const signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(1000) // 1 second timeout
        : undefined;
      return fetch(input, {
        ...init,
        ...(signal ? { signal } : {})
      });
    }
  });
  return redis;
}

/**
 * Report a Redis failure to temporarily trigger the circuit breaker.
 */
export function reportRedisFailure() {
  if (isHealthy) {
    console.warn('⚠️ Redis connection failed. Temporarily disabling caching for 60 seconds to avoid request latency.');
    isHealthy = false;
    lastCheckTime = Date.now();
  }
}
