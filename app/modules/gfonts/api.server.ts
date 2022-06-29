import { inspect } from "util"
import * as z from "zod"
import { raise } from "~/modules/common/error"
import { cacheGet, cacheSet } from "../redis"

export type Font = z.infer<typeof fontSchema>
const fontSchema = z
  .object({
    family: z.string(),
    variants: z.array(z.string()),
  })
  .passthrough()

const fontArraySchema = z.array(fontSchema)

const apiKey = process.env.GOOGLE_API_KEY ?? raise("GOOGLE_API_KEY is not set")

export async function loadFonts(): Promise<Font[]> {
  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set("key", apiKey)
  apiUrl.searchParams.set("sort", "popularity")
  return (
    (await loadFontsFromCache(apiUrl.href)) ||
    (await loadFontsFromApi(apiUrl.href))
  )
}

async function loadFontsFromCache(key: string) {
  try {
    const result = await cacheGet(key)
    return fontArraySchema.parse(result && JSON.parse(result))
  } catch (error) {
    console.warn("Error loading fonts from cache:", error)
    return undefined
  }
}

async function loadFontsFromApi(url: string) {
  const response = await fetch(url)
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

  const data = await response.json()
  const fonts = fontArraySchema.parse(data.items)
  await cacheSet(url, JSON.stringify(fonts))
  return fonts
}
