import type { RedisClientType } from "redis"
import { createClient } from "redis"

type RedisClient = RedisClientType

declare global {
  module globalThis {
    var __redisClientPromise: Promise<RedisClient | undefined> | undefined
  }
}

function getClient(): Promise<RedisClient | undefined> {
  if (globalThis.__redisClientPromise) {
    return globalThis.__redisClientPromise
  }

  const promise = createConnectedClient().catch((error) => {
    console.warn("Failed to connect to redis:", error)
    globalThis.__redisClientPromise = undefined
    return undefined
  })
  return (globalThis.__redisClientPromise = promise)
}

async function createConnectedClient(): Promise<RedisClient> {
  const newClient: RedisClient = createClient({ url: process.env.REDIS_URL })
  await newClient.connect()
  console.info("Connected to Redis")
  return newClient
}

export async function cacheGet(key: string): Promise<string | undefined> {
  const client = await getClient()
  return (await client?.get(key)) ?? undefined
}

export async function cacheSet(
  key: string,
  value: string,
  { expireAfterSeconds }: { expireAfterSeconds?: number } = {},
) {
  const client = await getClient()
  await client?.set(key, value, { EX: expireAfterSeconds })
}
