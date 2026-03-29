import { getRedisClient } from "@/lib/redis";

type CacheOptions = {
  ttlSeconds: number;
};

export const CACHE_TTL = {
  BLOG_LIST_SECONDS: 600,
  BLOG_POST_SECONDS: 1800,
  ADMIN_STATS_SECONDS: 90,
} as const;

export function buildCacheKey(...parts: string[]) {
  return ["app", "v1", ...parts].join(":");
}

export async function getOrSetCache<T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions,
): Promise<T> {
  const redis = getRedisClient();

  if (!redis) {
    return loader();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch {
    return loader();
  }

  const fresh = await loader();

  try {
    await redis.set(key, fresh, { ex: options.ttlSeconds });
  } catch {
    // Fail-open: keep request successful even if cache write fails.
  }

  return fresh;
}

export async function deleteCacheKey(key: string) {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    // No-op by design.
  }
}
