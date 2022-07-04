import { FontListItem } from "~/modules/fonts/font-context"

export const getDefaultVariant = (font: FontListItem) =>
  font.variants.find(
    (variant) => variant.style === "normal" && variant.weight === "400",
  ) ?? font.variants[0]!
