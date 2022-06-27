import { inspect } from "util"
import { raise } from "~/modules/common/error"

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

  return response.json()
}
