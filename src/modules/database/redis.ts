import Redis from "ioredis";

let client: Redis | null = null;
export const RedisPrefix = process.env.REDIS_PREFIX || "dev";

export async function redisClient() {
  if (
    !process.env.REDIS_PASSWORD ||
    !process.env.REDIS_PREFIX ||
    !process.env.REDIS_URL
  ) {
    throw new Error("Redis enviroment are not set");
  }

  if (client) return client;

  client = new Redis({
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: `${RedisPrefix}:`,
  });

  return client;
}
