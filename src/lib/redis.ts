// src/lib/redis.ts
import { Redis } from "@upstash/redis";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let realClient: Redis | null = null;
if (hasRedisEnv) {
  try {
    realClient = Redis.fromEnv();
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis client:", err);
  }
}

// Resilient wrapper: intercepts all calls so network/DNS failure (ENOTFOUND) never crashes application logic
export const redis = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!realClient) return null;
    try {
      return (await realClient.get<T>(key)) ?? null;
    } catch (err) {
      console.warn("Redis GET failed (falling back to database):", (err as Error)?.message || err);
      return null;
    }
  },

  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<"OK" | null> {
    if (!realClient) return null;
    try {
      if (opts?.ex) {
        return (await realClient.set(key, value, { ex: opts.ex })) as "OK";
      }
      return (await realClient.set(key, value)) as "OK";
    } catch (err) {
      console.warn("Redis SET failed (continuing without cache):", (err as Error)?.message || err);
      return null;
    }
  },

  async del(...keys: string[]): Promise<number> {
    if (!realClient) return 0;
    try {
      return await realClient.del(...keys);
    } catch (err) {
      console.warn("Redis DEL failed (continuing):", (err as Error)?.message || err);
      return 0;
    }
  },
} as unknown as Redis;