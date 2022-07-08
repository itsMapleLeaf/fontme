import { useStore } from "@nanostores/react"
import { atom } from "nanostores"
import { useEffect } from "react"

const loaders = new Map<string, FontLoader>()

export function useFontLoader(
  family: string,
  { weight, style }: { weight: string; style: string },
  text: string,
) {
  const loader = (() => {
    const key = `${family}-${weight}-${style}-${text}`
    let loader = loaders.get(key)
    if (!loader) {
      loader = new FontLoader(family, { weight, style }, text)
      loaders.set(key, loader)
    }
    return loader
  })()

  useEffect(() => loader.load(), [loader])

  return useStore(loader.status)
}

class FontLoader {
  status = atom<"idle" | "loading" | "loaded" | "error">("idle")

  constructor(
    readonly family: string,
    readonly variant: { weight: string; style: string },
    readonly text: string,
  ) {}

  load() {
    if (this.status.get() !== "idle") return
    this.status.set("loading")

    const { weight, style } = this.variant

    const variantParam =
      style === "italic" ? `ital,wght@1,${weight}` : `wght@${weight}`

    const params = new URLSearchParams()
    params.set("family", `${this.family}:${variantParam}`)
    params.set("display", "swap")
    params.set("text", this.text)

    const link = document.createElement("link")
    link.href = `https://fonts.googleapis.com/css2?${params}`
    link.rel = "stylesheet"

    link.addEventListener("error", () => {
      this.status.set("error")
    })

    // when the stylesheet loads, the font itself may not have actually loaded yet,
    // so we have to wait until it does
    link.addEventListener("load", async () => {
      let loaded = false
      while (!loaded) {
        const result = await document.fonts.load(
          `${weight} ${style} 16px "${this.family}"`,
        )
        loaded = result.length > 0
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      this.status.set("loaded")
    })

    document.head.append(link)
  }
}
