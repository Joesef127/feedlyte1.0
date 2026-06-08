import { RateLimiterMemory } from "rate-limiter-flexible";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // 15 min
});

const widgetLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, // 1 min
});

export async function checkAuthRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  try {
    if (!ip) {
      return { success: false, limit: 5, remaining: 0, reset: Math.ceil(Date.now() / 1000) };
    }
    const result = await authLimiter.consume(ip);
    return {
      success: true,
      limit: 5,
      remaining: result.remainingPoints,
      reset: Math.ceil(Date.now() / 1000 + result.msBeforeNext / 1000),
    };
  } catch (result: any) {
    return {
      success: false,
      limit: 5,
      remaining: 0,
      reset: Math.ceil(Date.now() / 1000 + result.msBeforeNext / 1000),
    };
  }
}

export async function checkWidgetRateLimit(
  projectId: string,
): Promise<RateLimitResult> {
  try {
    const result = await widgetLimiter.consume(projectId);

    return {
      success: true,
      limit: 10,
      remaining: result.remainingPoints,
      reset: Math.ceil(Date.now() / 1000 + result.msBeforeNext / 1000),
    };
  } catch (result: any) {
    return {
      success: false,
      limit: 10,
      remaining: 0,
      reset: Math.ceil(Date.now() / 1000 + result.msBeforeNext / 1000),
    };
  }
}

export function rateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}