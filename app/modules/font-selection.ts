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

  toParamString = () =>
    Object.entries(this.selections)
      .filter(([, variants]) => variants.length > 0)
      .map(([family, variants]) => `${family}:${variants.join(",")}`)
      .join(";")

  isSelected = (family: string, variant: string) => {
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
}

const caseInsensitiveEquals = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()
