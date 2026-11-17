interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000; // 1 minute

/**
 * Check whether a request identified by `key` is within the rate limit.
 * @param key - Unique identifier (e.g. IP address, user ID)
 * @param limit - Maximum requests per window (default: 10)
 * @param windowMs - Window size in milliseconds (default: 60000)
 */
export function checkRateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();

  const entry = store.get(key);

  if (entry === undefined || now >= entry.resetAt) {
    // New window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  const remaining = limit - entry.count;
  return { allowed: true, remaining, resetAt: entry.resetAt };
}

/**
 * Reset the rate limit entry for a key (useful in tests).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Clear all rate limit entries (useful in tests).
 */
export function clearRateLimits(): void {
  store.clear();
}
