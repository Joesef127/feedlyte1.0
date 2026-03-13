/**
 * In-memory rate limiter.
 * Limits requests per unique key (e.g. IP address) within a time window.
 *
 * Note: Resets on server restart. Not suitable for multi-instance deployments
 * without a shared store (e.g. Redis). For MVP this is sufficient.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: options.limit - 1, resetAt };
  }

  if (record.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    success: true,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  };
}

// Feedback endpoint: 10 submissions per 15 minutes per IP
export const feedbackRateLimit = (key: string) =>
  rateLimit(key, { limit: 10, windowMs: 15 * 60 * 1000 });
