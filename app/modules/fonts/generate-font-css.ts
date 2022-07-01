import endent from "endent"
import { FontSelector } from "~/modules/fonts/font-selector"
import { loadFonts } from "./api.server"

export async function generateFontCss(selector: FontSelector) {
  const fontDict = await loadFonts()

  return Object.entries(selector.selections)
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
      const css = endent // cue prettier into formatting this as css
      return css`
        @font-face {
          font-family: ${JSON.stringify(family)};
          font-style: ${variant.style};
          font-weight: ${variant.weight};
          src: url(${variant.url}) format("woff2");
        }
      `
    })
    .join("\n\n")
}
