import type {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis"
import { createClient } from "redis"

let client:
  | RedisClientType<RedisModules, RedisFunctions, RedisScripts>
  | undefined

async function getClient() {
  if (client) {
    return client
  }

  try {
    const newClient = createClient({ url: process.env.REDIS_URL })
    await newClient.connect()
    console.info("Connected to Redis")
    return (client = newClient)
  } catch (error) {
    console.warn("Failed to connect to redis.", error)
    return undefined
  }
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