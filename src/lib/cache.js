import { getRedis, reportRedisFailure } from './redis';

// ============================================
// 🗄️ CACHE HELPER
// Simple get/set/invalidate with TTL support
// Falls back to direct DB queries if Redis unavailable
// ============================================

const DEFAULT_TTL = 300; // 5 minutes in seconds

/**
 * Get a cached value by key.
 * @param {string} key - Cache key
 * @returns {any|null} Parsed value or null
 */
export async function cacheGet(key) {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    return data || null;
  } catch (err) {
    console.error('Cache GET error:', err.message);
    reportRedisFailure();
    return null;
  }
}

/**
 * Set a value in cache with TTL.
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON serialized)
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
export async function cacheSet(key, value, ttl = DEFAULT_TTL) {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch (err) {
    console.error('Cache SET error:', err.message);
    reportRedisFailure();
  }
}

/**
 * Delete a specific cache key.
 * @param {string} key - Cache key to invalidate
 */
export async function cacheDelete(key) {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache DELETE error:', err.message);
    reportRedisFailure();
  }
}

/**
 * Invalidate all keys matching a pattern.
 * Useful for clearing all course-related caches when a course is updated.
 * @param {string} pattern - Pattern like "course:*"
 */
export async function cacheInvalidatePattern(pattern) {
  const redis = getRedis();
  if (!redis) return;

  try {
    // Upstash supports SCAN-based deletion
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await Promise.all(keys.map(k => redis.del(k)));
      }
    } while (cursor !== 0);
  } catch (err) {
    console.error('Cache INVALIDATE PATTERN error:', err.message);
    reportRedisFailure();
  }
}

/**
 * Cache-aside pattern: Try cache first, fallback to fetcher, then cache result.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that returns data from DB
 * @param {number} ttl - TTL in seconds
 * @returns {any} Data from cache or fetcher
 */
export async function cacheOrFetch(key, fetcher, ttl = DEFAULT_TTL) {
  // Try cache first
  const cached = await cacheGet(key);
  if (cached) {
    // Upstash auto-parses JSON, but if it's already an object, return directly
    if (typeof cached === 'string') {
      try { return JSON.parse(cached); } catch { return cached; }
    }
    return cached;
  }

  // Cache miss — fetch from DB
  const data = await fetcher();

  // Store in cache for next time
  if (data) {
    await cacheSet(key, data, ttl);
  }

  return data;
}
