import hljs from "highlight.js"
import { format } from "prettier"
import { FontSelector } from "~/modules/fonts/font-selector"
import { loadFonts } from "./api.server"

export async function generateFontCss(selector: FontSelector) {
  const fontDict = await loadFonts()

  let css = Object.entries(selector.selections)
    .flatMap(([familyName, variantNames]) => {
      const variantDict = fontDict.families[familyName]?.variants

      const variants =
        variantDict && variantNames.map((name) => variantDict[name])

      return (
        variants?.flatMap((variant) =>
          variant ? { family: familyName, variant } : [],
        ) ?? []
      )
    })
    .map(({ family, variant }) => {
      const normalizedFamily = family.replaceAll(" ", "-")
      const fontUrl = `/fonts/${normalizedFamily}-${variant.weight}-${variant.style}.woff2`
      return `
        @font-face {
          font-family: ${JSON.stringify(family)};
          font-style: ${variant.style};
          font-weight: ${variant.weight};
          src: url(${fontUrl}) format("woff2");
        }
      `
    })
    .join("\n\n")

  css = format(css, { parser: "css" })
  return { code: css, __html: hljs.highlight(css, { language: "css" }).value }
}
