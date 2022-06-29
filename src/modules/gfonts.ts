import { inspect } from "util"
import * as z from "zod"
import { raise } from "./common/error.js"
import { cacheGet, cacheSet } from "./redis.js"

export type Font = z.infer<typeof fontSchema>
const fontSchema = z
  .object({
    family: z.string(),
    variants: z.array(z.string()),
  })
  .passthrough()

const fontListSchema = z.array(fontSchema)

export async function loadFonts(): Promise<Font[]> {
  const apiKey =
    import.meta.env.GOOGLE_API_KEY ?? raise("GOOGLE_API_KEY is not set")

  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set("key", apiKey)
  apiUrl.searchParams.set("sort", "popularity")

  const fonts =
    (await logTime(loadFontsFromCache, apiUrl.href)) ||
    (await logTime(loadFontsFromApi, apiUrl.href))

  return fonts
}

async function loadFontsFromCache(
  cacheKey: string,
): Promise<Font[] | undefined> {
  try {
    const result = await cacheGet(cacheKey)
    return fontListSchema.parse(result && JSON.parse(result))
  } catch (error) {
    console.warn("Error loading fonts from cache:", error)
    return undefined
  }
}

async function loadFontsFromApi(url: string): Promise<Font[]> {
  const response = await fetch(url)
  if (response.status !== 200) {
    const errorData = await response
      .clone()
      .json()
      .catch(() => ({}))

    console.error(
      "Google Fonts API error:",
      inspect(errorData, { depth: Infinity, colors: true }),
    )

    throw new Error("An error occurred while fetching fonts")
  }

  const data = await response.json()
  const fonts = fontListSchema.parse(data.items)

  await cacheSet(url, JSON.stringify(fonts), {
    expireAfterSeconds: 60 * 60 * 24 * 7,
  }).catch((error) => {
    console.warn("Failed to cache fonts:", error)
  })

  return fonts
}

async function logTime<Args extends unknown[], Result>(
  fn: (...args: Args) => PromiseLike<Result> | Result,
  ...args: Args
): Promise<Result> {
  console.time(fn.name)
  const result = await fn(...args)
  console.timeEnd(fn.name)
  return result
}
