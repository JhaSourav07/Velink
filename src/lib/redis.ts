// src/lib/redis.ts
import { Redis } from "@upstash/redis";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = hasRedisEnv
  ? Redis.fromEnv()
  : ({
      get: async () => null,
      set: async () => "OK",
      del: async () => 1,
    } as unknown as Redis);