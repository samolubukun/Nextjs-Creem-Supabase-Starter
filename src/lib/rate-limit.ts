import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

type RateLimitPolicy = {
  keyPrefix: string;
  limit: number;
  window: "10 s" | "30 s" | "60 s" | "5 m" | "10 m" | "15 m" | "1 h";
};

type RateLimitResult = {
  ok: boolean;
  response?: NextResponse;
  headers: Headers;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(policy: RateLimitPolicy): Ratelimit {
  const redis = getRedisClient();
  if (!redis) throw new Error("Redis not configured");

  const existing = limiters.get(policy.keyPrefix);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    analytics: true,
    prefix: "ratelimit",
  });
  limiters.set(policy.keyPrefix, limiter);
  return limiter;
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function buildHeaders(limit: number, remaining: number, reset: number) {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(limit));
  headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  headers.set("X-RateLimit-Reset", String(reset));
  return headers;
}

export async function enforceRateLimit(
  request: NextRequest,
  policy: RateLimitPolicy,
  userId?: string,
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    return { ok: true, headers: new Headers() };
  }

  const identity = userId ?? getClientIp(request);
  const key = `${policy.keyPrefix}:${identity}`;

  const limiter = getLimiter(policy);
  const result = await limiter.limit(key);
  const headers = buildHeaders(result.limit, result.remaining, result.reset);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    headers.set("Retry-After", String(retryAfter));

    const response = NextResponse.json({ error: "Too many requests" }, { status: 429 });
    headers.forEach((value, headerKey) => {
      response.headers.set(headerKey, value);
    });
    return { ok: false, response, headers };
  }

  return { ok: true, headers };
}

export const rateLimitPolicies = {
  chat: { keyPrefix: "chat", limit: 20, window: "60 s" } as const,
  checkout: { keyPrefix: "checkout", limit: 10, window: "10 m" } as const,
  welcome: { keyPrefix: "welcome", limit: 5, window: "1 h" } as const,
  subscriptionMutation: { keyPrefix: "subscription", limit: 30, window: "10 m" } as const,
};
