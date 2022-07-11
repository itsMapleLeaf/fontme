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
  weight: z.string(),
  style: z.string(),
  url: z.string(),
})
export type FontVariant = z.infer<typeof fontVariantSchema>

const fontVariantRecordSchema = z.record(fontVariantSchema)
export type FontVariantRecord = z.infer<typeof fontVariantRecordSchema>

const fontDictSchema = z.object({
  /** ordered list of font families */
  familyNames: z.array(z.string()),

  /** dictionary of each family for easy reference */
  families: z.record(z.object({ variants: fontVariantRecordSchema })),
})
export type FontDict = z.infer<typeof fontDictSchema>

export async function loadFonts(): Promise<FontDict> {
  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set("key", apiKey)
  apiUrl.searchParams.set("sort", "popularity")

  return (
    (await loadFontsFromCache(apiUrl.href)) ||
    (await loadFontsFromApi(apiUrl.href))
  )
}

async function loadFontsFromApi(url: string): Promise<FontDict> {
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

  const fonts: FontDict = {
    familyNames: data.items.map((item) => item.family),
    families: Object.fromEntries(
      data.items.map((item) => [
        item.family,
        {
          variants: Object.fromEntries(
            Object.entries(item.files).flatMap(([name, url]) => {
              const variant = parseVariant(name, url)
              return [variant ? [name, variant] : []]
            }),
          ),
        },
      ]),
    ),
  }

  await cacheSet(url, JSON.stringify(fonts))

  return fonts
}

async function loadFontsFromCache(key: string): Promise<FontDict | undefined> {
  try {
    const result = await cacheGet(key)
    if (!result) return

    return fontDictSchema.parse(JSON.parse(result))
  } catch (error) {
    console.warn("Error loading fonts from cache:", error)
    return undefined
  }
}

function parseVariant(name: string, url: string): FontVariant | undefined {
  if (name === "regular") {
    return { url, weight: "400", style: "normal" }
  }
  if (name === "italic") {
    return { url, weight: "400", style: "italic" }
  }
  if (name.includes("italic")) {
    return { url, weight: name.replace("italic", ""), style: "italic" }
  }
  if (name.match(/^\d{3}$/)) {
    return { url, weight: name, style: "normal" }
  }
  console.warn("Failed to parse variant:", name, url)
}
