import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Vercel KV client ──────────────────────────────────────────────────────────
// Vercel KV automatically injects KV_REST_API_URL and KV_REST_API_TOKEN
// when you add a KV database to your project in the Vercel dashboard.
// Pull them locally with: vercel env pull .env.local

const redis = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// ── Widget submission limiter ─────────────────────────────────────────────────
// 10 submissions per project per 60 seconds, sliding window.
// Key: project ID — each project has its own independent counter.

const widgetLimiter = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(10, "60 s"),
  prefix:    "feedlyte:widget",
  analytics: false,
});

// ── Auth limiter ──────────────────────────────────────────────────────────────
// 5 attempts per IP per 15 minutes on sensitive auth endpoints.
// Key: IP address.

const authLimiter = new Ratelimit({
  redis,
  limiter:   Ratelimit.slidingWindow(5, "15 m"),
  prefix:    "feedlyte:auth",
  analytics: false,
});

// ── Public interface ──────────────────────────────────────────────────────────

export interface RateLimitResult {
  success:   boolean;
  limit:     number;
  remaining: number;
  reset:     number;
}

/**
 * Rate limit widget submissions by project ID.
 */
export async function checkWidgetRateLimit(
  projectId: string
): Promise<RateLimitResult> {
  const { success, limit, remaining, reset } = await widgetLimiter.limit(projectId);
  return { success, limit, remaining, reset };
}

/**
 * Rate limit auth endpoints by IP address.
 */
export async function checkAuthRateLimit(
  ip: string
): Promise<RateLimitResult> {
  const key = ip || "anonymous";
  const { success, limit, remaining, reset } = await authLimiter.limit(key);
  return { success, limit, remaining, reset };
}

/**
 * Build rate limit headers to include in API responses.
 */
export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit":     String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset":     String(result.reset),
  };
}