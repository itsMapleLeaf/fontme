import { inspect } from "util"
import { raise } from "~/modules/common/error"

export async function googleFontsApiFetch(): Promise<GoogleFontsAPIResponse> {
  const apiUrl = new URL("https://www.googleapis.com/webfonts/v1/webfonts")
  apiUrl.searchParams.set(
    "key",
    process.env.GOOGLE_API_KEY ?? raise("GOOGLE_API_KEY is not set"),
  )
  apiUrl.searchParams.set("sort", "popularity")

  const response = await fetch(apiUrl.href)
  if (response.status !== 200) {
    console.log(
      "Google Fonts API error:",
      inspect(
        await response
          .clone()
          .json()
          .catch(() => ({})),
        { depth: Infinity, colors: true },
      ),
    )
    throw new Response(undefined, {
      status: 500,
      statusText: "An error occurred fetching from Google Fonts",
    })
  }

  return response.json()
}

export interface GoogleFontsAPIResponse {
  kind: string
  items: Item[]
}

export interface Item {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: Record<string, string>
  category: "display" | "handwriting" | "monospace" | "sans-serif" | "serif"
}
