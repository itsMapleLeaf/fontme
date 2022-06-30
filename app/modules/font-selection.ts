import { useSearchParams } from "@remix-run/react"

// query param format: ?selection=Roboto:400,400italic;Roboto+Mono:400,400italic
export function useFontSelection() {
  const [params, setParams] = useSearchParams()

  const selections = parseFontSelectionSearchParam(params.get("fonts") ?? "")

  const isSelected = (family: string, variant: string) => {
    const variants = Object.entries(selections).find(([familyName]) =>
      caseInsensitiveEquals(familyName, family),
    )?.[1]
    return variants?.some((v) => caseInsensitiveEquals(v, variant)) ?? false
  }

  const select = (family: string, variant: string) => {
    const familyKey =
      Object.keys(selections).find((familyName) =>
        caseInsensitiveEquals(familyName, family),
      ) || family

    setParams({
      ...Object.fromEntries(params),
      fonts: encodeFontSelectionSearchParam({
        ...selections,
        [familyKey]: [...(selections[family] ?? []), variant],
      }),
    })
  }

  const deselect = (family: string, variant: string) => {
    const familyKey =
      Object.keys(selections).find((familyName) =>
        caseInsensitiveEquals(familyName, family),
      ) || family

    setParams({
      ...Object.fromEntries(params),
      fonts: encodeFontSelectionSearchParam({
        ...selections,
        [familyKey]:
          selections[family]?.filter(
            (v) => !caseInsensitiveEquals(v, variant),
          ) ?? [],
      }),
    })
  }

  return { selections, isSelected, select, deselect }
}

export function parseFontSelectionSearchParam(searchParam: string) {
  const fontSelections: { [family: string]: string[] } = {}

  for (const selectionPair of searchParam.split(";")) {
    const [family, variants] = selectionPair.split(":")
    if (family && variants) {
      fontSelections[family] = variants?.split(",") ?? []
    }
  }

  return fontSelections
}

export function encodeFontSelectionSearchParam(fontSelections: {
  [family: string]: string[]
}) {
  return Object.entries(fontSelections)
    .filter(([, variants]) => variants.length > 0)
    .map(([family, variants]) => `${family}:${variants.join(",")}`)
    .join(";")
}

const caseInsensitiveEquals = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()
