import { inspect } from "util"
import { raise } from "~/modules/common/error"
import { cacheGet, cacheSet } from "../redis"

export type FontList = {
  kind: string
  items: Font[]
}

export type Font = {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: Record<string, string>
  category: "display" | "handwriting" | "monospace" | "sans-serif" | "serif"
}

export async function loadFonts(): Promise<FontList> {
  const apikey =
    process.env.GOOGLE_API_KEY ?? raise("GOOGLE_API_KEY is not set")

  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set("key", apikey)
  apiUrl.searchParams.set("sort", "popularity")

  console.time("fetch from cache")
  const cacheKey = apiUrl.toString()
  const cachedResult = await cacheGet(cacheKey)
    .then((result) => result && JSON.parse(result))
    .catch((error) => {
      console.warn("Error loading fonts from cache:", error)
      return undefined
    })
  console.timeEnd("fetch from cache")

  if (cachedResult) {
    console.info("Loaded fonts from cache")
    return cachedResult
  }

  console.time("fetch from api")
  const response = await fetch(apiUrl.href)
  if (response.status !== 200) {
    const errorData = await response
      .clone()
      .json()
      .catch(() => ({}))

    console.log(
      "Google Fonts API error:",
      inspect(errorData, { depth: Infinity, colors: true }),
    )

    throw new Response(undefined, {
      status: 500,
      statusText: "An error occurred while fetching fonts",
    })
  }

  let data = await response.json()
  data = { ...data, items: data.items.slice(10) }
  console.timeEnd("fetch from api")

  console.time("cache api data")
  await cacheSet(cacheKey, JSON.stringify(data), {
    expireAfterSeconds: 60 * 60 * 24 * 7,
  })
  console.timeEnd("cache api data")

  return data
}
