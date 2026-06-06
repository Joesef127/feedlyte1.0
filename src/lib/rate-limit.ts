import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Vercel KV client ──────────────────────────────────────────────────────────
// KV_REST_API_URL and KV_REST_API_TOKEN are injected by Vercel when a KV
// database is linked. Pull locally with: vercel env pull .env.local
//
// In development without KV configured, rate limiting is bypassed gracefully
// rather than crashing the app.

const hasKvConfig =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

const redis = hasKvConfig
  ? new Redis({
      url:   process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

const widgetLimiter = redis
  ? new Ratelimit({
      redis,
      limiter:   Ratelimit.slidingWindow(10, "60 s"),
      prefix:    "feedlyte:widget",
      analytics: false,
    })
  : null;

const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter:   Ratelimit.slidingWindow(5, "15 m"),
      prefix:    "feedlyte:auth",
      analytics: false,
    })
  : null;

// ── Public interface ──────────────────────────────────────────────────────────

export interface RateLimitResult {
  success:   boolean;
  limit:     number;
  remaining: number;
  reset:     number;
}

// Permissive result used when KV is not configured (dev / missing env vars)
const BYPASS: RateLimitResult = {
  success:   true,
  limit:     999,
  remaining: 999,
  reset:     0,
};

export async function checkWidgetRateLimit(
  projectId: string
): Promise<RateLimitResult> {
  if (!widgetLimiter) return BYPASS;
  const { success, limit, remaining, reset } = await widgetLimiter.limit(projectId);
  return { success, limit, remaining, reset };
}

export async function checkAuthRateLimit(
  ip: string
): Promise<RateLimitResult> {
  if (!authLimiter) return BYPASS;
  const key = ip || "anonymous";
  const { success, limit, remaining, reset } = await authLimiter.limit(key);
  return { success, limit, remaining, reset };
}

export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit":     String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset":     String(result.reset),
  };
}