import { inspect } from "util"
import * as z from "zod"
import { raise } from "~/modules/common/error"
import { cacheGet, cacheSet } from "../redis"

const apiKey = process.env.GOOGLE_API_KEY ?? raise("GOOGLE_API_KEY is not set")

const apiResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          family: z.string(),
          files: z.record(z.string()),
        })
        .passthrough(),
    ),
  })
  .passthrough()

const fontVariantSchema = z.object({
  name: z.string(),
  weight: z.string(),
  style: z.string(),
  url: z.string(),
})
export type FontVariant = z.infer<typeof fontVariantSchema>

const fontSchema = z.object({
  family: z.string(),
  variants: z.array(fontVariantSchema),
})
export type Font = z.infer<typeof fontSchema>

export async function loadFonts(): Promise<Font[]> {
  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set("key", apiKey)
  apiUrl.searchParams.set("sort", "popularity")
  return (
    (await loadFontsFromCache(apiUrl.href)) ||
    (await loadFontsFromApi(apiUrl.href))
  )
}

async function loadFontsFromCache(key: string): Promise<Font[] | undefined> {
  try {
    const result = await cacheGet(key)
    return z.array(fontSchema).parse(result && JSON.parse(result))
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

    console.log(
      "Google Fonts API error:",
      inspect(errorData, { depth: Infinity, colors: true }),
    )

    throw new Response(undefined, {
      status: 500,
      statusText: "An error occurred while fetching fonts",
    })
  }

  const data = apiResponseSchema.parse(await response.json())

  const fonts = data.items.map((item) => ({
    family: item.family,
    variants: Object.entries(item.files).flatMap(
      ([name, url]) => parseVariant(name, url) ?? [],
    ),
  }))

  await cacheSet(url, JSON.stringify(fonts))

  return fonts
}

function parseVariant(name: string, url: string): FontVariant | undefined {
  if (name === "regular") {
    return { name, url, weight: "400", style: "normal" }
  }
  if (name === "italic") {
    return { name, url, weight: "400", style: "italic" }
  }
  if (name.includes("italic")) {
    return { name, url, weight: name.replace("italic", ""), style: "italic" }
  }
  if (name.match(/^\d{3}$/)) {
    return { name, url, weight: name, style: "normal" }
  }
  console.warn("Failed to parse variant:", name, url)
}
