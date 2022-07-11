import { expect, test } from "vitest"
import { makeFontContext } from "./font-context"
import { FontDict } from "./load-fonts.server"

const fontDict: FontDict = {
  familyNames: ["Roboto", "Roboto Mono"],
  families: {
    "Roboto": {
      variants: {
        "400": { weight: "400", style: "normal", url: "roboto-400.woff" },
        "400italic": {
          weight: "400",
          style: "italic",
          url: "roboto-400italic.woff",
        },
      },
    },
    "Roboto Mono": {
      variants: {
        "400": { weight: "400", style: "normal", url: "roboto-mono-400.woff" },
        "400italic": {
          weight: "400",
          style: "italic",
          url: "roboto-mono-400italic.woff",
        },
      },
    },
  },
}

test("getDeselectVariantLink returns a link to deselect a variant", () => {
  const context = makeFontContext(
    fontDict,
    new URLSearchParams({
      fonts: "Roboto:400,400italic;Roboto Mono:400,400italic",
    }),
  )

  expect(context.getDeselectVariantLink("Roboto", "400italic")).toBe(
    "?" +
      new URLSearchParams(
        "fonts=Roboto:400;Roboto+Mono:400,400italic",
      ).toString(),
  )
})
