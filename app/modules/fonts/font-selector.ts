import { FontDict } from "./api.server"

export type FontSelections = {
  [family: string]: string[]
}

export class FontSelector {
  constructor(readonly selections: FontSelections) {}

  // query param format: ?selection=Roboto:400,400italic;Roboto+Mono:400,400italic
  static fromParamString(paramString: string): FontSelector {
    const fontSelections: { [family: string]: string[] } = {}
    for (const selectionPair of paramString.split(";")) {
      const [family, variants] = selectionPair.split(":")
      if (family && variants) {
        fontSelections[family] = variants?.split(",") ?? []
      }
    }
    return new FontSelector(fontSelections)
  }

  sortedSelections = (dict: FontDict) => {
    const weightRank = (family: string, variantName: string) =>
      dict.families[family]?.variants?.[variantName]?.weight ?? variantName

    const styleRank = (family: string, variantName: string) => {
      const style =
        dict.families[family]?.variants?.[variantName]?.style ?? variantName
      return style === "normal" ? 0 : style === "italic" ? 1 : 2
    }

    return Object.entries(this.selections)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([family, variants]) => ({
        family,
        variants: variants
          .sort((a, b) =>
            weightRank(family, a).localeCompare(weightRank(family, b)),
          )
          .sort((a, b) => styleRank(family, a) - styleRank(family, b)),
      }))
  }

  toParamString = () =>
    Object.entries(this.selections)
      .filter(([, variants]) => variants.length > 0)
      .map(([family, variants]) => `${family}:${variants.join(",")}`)
      .join(";")

  isFamilySelected = (family: string) =>
    Object.entries(this.selections).some(([entryFamily, variants]) => {
      return caseInsensitiveEquals(family, entryFamily) && variants?.length > 0
    })

  isVariantSelected = (family: string, variant: string) => {
    const variants = Object.entries(this.selections).find(([familyName]) =>
      caseInsensitiveEquals(familyName, family),
    )?.[1]
    return variants?.some((v) => caseInsensitiveEquals(v, variant)) ?? false
  }

  select = (family: string, variant: string) => {
    const familyKey =
      Object.keys(this.selections).find((familyName) =>
        caseInsensitiveEquals(familyName, family),
      ) || family

    return new FontSelector({
      ...this.selections,
      [familyKey]: [...(this.selections[family] ?? []), variant],
    })
  }

  deselect = (family: string, variant: string) => {
    const familyKey =
      Object.keys(this.selections).find((familyName) =>
        caseInsensitiveEquals(familyName, family),
      ) || family

    return new FontSelector({
      ...this.selections,
      [familyKey]:
        this.selections[family]?.filter(
          (v) => !caseInsensitiveEquals(v, variant),
        ) ?? [],
    })
  }

  deselectFamily = (family: string) => {
    const familyKey =
      Object.keys(this.selections).find((familyName) =>
        caseInsensitiveEquals(familyName, family),
      ) || family

    const { [familyKey]: _, ...newSelections } = this.selections
    return new FontSelector(newSelections)
  }
}

const caseInsensitiveEquals = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()
