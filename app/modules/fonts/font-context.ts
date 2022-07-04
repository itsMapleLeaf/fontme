import { raise } from "../common/error"
import { omit } from "../common/omit"
import { compactParams } from "../dom/compact-params"
import { FontDict } from "./api.server"

// query param format: ?fonts=Roboto:400,400italic;Roboto+Mono:400,400italic
export type ParsedFontsParam = {
  [familyName: string]: {
    [variantName: string]: true
  }
}

export type FontListItem = {
  family: string
  variants: VariantListItem[]
}

export type VariantListItem = {
  name: string
  weight: string
  style: string
  selected: boolean
}

export type FontContext = ReturnType<typeof makeFontContext>

export function makeFontContext(
  fontDict: FontDict,
  searchParams: URLSearchParams,
) {
  const selectedFonts: ParsedFontsParam = (() => {
    const selectionString = searchParams.get("fonts") ?? ""
    const selectedFonts: ParsedFontsParam = {}

    for (const familyPair of selectionString.split(";")) {
      const [familyName, variantNamesString] = familyPair.split(":")
      if (familyName && variantNamesString) {
        const selectedVariants = (selectedFonts[familyName] ??= {})
        for (const variantName of variantNamesString.split(",")) {
          selectedVariants[variantName] = true
        }
      }
    }

    return selectedFonts
  })()

  const makeVariantList = (
    variantNames: string[],
    familyName: string,
  ): VariantListItem[] =>
    variantNames
      .flatMap((name) => {
        const variant = fontDict.families[familyName]?.variants?.[name]
        if (!variant) return []
        return {
          name,
          weight: variant.weight,
          style: variant.style,
          selected: !!selectedFonts[familyName]?.[name],
        }
      })
      .sort((a, b) => a.weight.localeCompare(b.weight))
      .sort((a, b) => styleRank(a.style) - styleRank(b.style))

  const styleRank = (style: string) =>
    style === "normal" ? 0 : style === "italic" ? 1 : 2

  const fontList: FontListItem[] = fontDict.familyNames.flatMap(
    (familyName) => {
      const family = fontDict.families[familyName]
      if (!family) return []
      return {
        family: familyName,
        variants: makeVariantList(Object.keys(family.variants), familyName),
      }
    },
  )

  const selectedFontList = Object.entries(selectedFonts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([familyName, selectedVariantRecord]) => ({
      family: familyName,
      variants: makeVariantList(Object.keys(selectedVariantRecord), familyName),
    }))

  const serializeFontSelections = (selections: ParsedFontsParam) =>
    Object.entries(selections)
      .map(([familyName, variantRecord]) =>
        Object.entries(variantRecord)
          .map(([name, variant]) => `${familyName}:${name}`)
          .join(","),
      )
      .join(";")

  const getSelectVariantLink = (familyName: string, variantName: string) =>
    "?" +
    compactParams({
      ...searchParams,
      fonts: serializeFontSelections({
        ...selectedFonts,
        [familyName]: {
          ...(selectedFonts[familyName] ?? {}),
          [variantName]: true,
        },
      }),
    })

  const getDeselectVariantLink = (familyName: string, variantName: string) =>
    "?" +
    compactParams({
      ...searchParams,
      fonts: serializeFontSelections({
        ...selectedFonts,
        [familyName]: omit(selectedFonts[familyName] ?? {}, [variantName]),
      }),
    })

  const getDeselectFamilyLink = (familyName: string) =>
    "?" +
    compactParams({
      ...searchParams,
      fonts: serializeFontSelections(omit(selectedFonts, [familyName])),
    })

  const getClearSelectionLink = () =>
    "?" + compactParams({ ...searchParams, fonts: "" })

  // returns the normal 400 variant if it exists, otherwise returns the first variant
  const getDefaultPreviewVariant = (familyName: string) => {
    const family = fontDict.families[familyName] ?? raise("Family not found")
    const variants = makeVariantList(Object.keys(family.variants), familyName)
    return (
      variants.find(
        (variant) => variant.weight === "400" && variant.style === "normal",
      ) ??
      variants[0] ??
      raise(`Font family ${familyName} has no variants`)
    )
  }

  return {
    fontList,
    selectedFontList,
    getSelectVariantLink,
    getDeselectVariantLink,
    getDeselectFamilyLink,
    getClearSelectionLink,
    getDefaultPreviewVariant,
  }
}
