import endent from "endent"
import { FontSelector } from "~/modules/fonts/font-selector"

export function generateFontCss(selector: FontSelector) {
  return Object.entries(selector.selections)
    .flatMap(([family, variants]) =>
      variants.map((variant) => ({ family, variant })),
    )
    .map(({ family, variant }) => {
      const css = endent // cue prettier into formatting this as css
      return css`
        @font-face {
          font-family: ${JSON.stringify(family)};
        }
      `
    })
    .join("\n\n")
}
