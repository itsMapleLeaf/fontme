import { raise } from "../common/error"
import { omit } from "../common/omit"
import { compactParams } from "../dom/compact-params"
import { css } from "../dom/css"
import { FontDict } from "./load-fonts.server"

// query param format: ?fonts=Roboto:400,400italic;Roboto+Mono:400,400italic
type ParsedFontsParam = {
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
  url: string
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
          url: variant.url,
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
      .map(
        ([familyName, variantRecord]) =>
          `${familyName}:${Object.keys(variantRecord).join(",")}`,
      )
      .join(";")

  const getSelectVariantLink = (familyName: string, variantName: string) =>
    "?" +
    compactParams({
      ...Object.fromEntries(searchParams),
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
      ...Object.fromEntries(searchParams),
      fonts: serializeFontSelections({
        ...selectedFonts,
        [familyName]: omit(selectedFonts[familyName] ?? {}, [variantName]),
      }),
    })

  const getDeselectFamilyLink = (familyName: string) =>
    "?" +
    compactParams({
      ...Object.fromEntries(searchParams),
      fonts: serializeFontSelections(omit(selectedFonts, [familyName])),
    })

  const getClearSelectionLink = () =>
    "?" + compactParams({ ...Object.fromEntries(searchParams), fonts: "" })

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

export function getFontFiles(context: FontContext, origin: string) {
  const selectedVariants = context.selectedFontList.flatMap((font) =>
    font.variants.map((variant) => ({ font, variant })),
  )

  const fontFiles = selectedVariants.map(({ font, variant }) => {
    const normalizedFamily = font.family.replaceAll(" ", "-")
    const fileName = `${normalizedFamily}-${variant.weight}-${variant.style}.woff2`

    const url = new URL(`/api/convert-to-woff2?url=${variant.url}`, origin)

    const data = fetch(url.toString()).then((response) =>
      response.ok
        ? response.arrayBuffer()
        : Promise.reject(new Error(response.statusText)),
    )

    return { font, variant, name: fileName, data }
  })

  const cssFile = {
    name: "fonts.css",
    data: Promise.all([
      import("prettier/standalone.js"),
      import("prettier/parser-postcss.js"),
    ]).then(([prettier, postcssParser]) => {
      const cssCode = fontFiles
        .map(
          ({ font, variant, name }) => css`
            @font-face {
              font-family: "${font.family}";
              font-style: ${variant.style};
              font-weight: ${variant.weight};
              src: url("./${name}") format("woff2");
            }
          `,
        )
        .join("\n\n")

      return prettier.default.format(cssCode, {
        parser: "css",
        plugins: [postcssParser.default],
      })
    }),
  }

  return [...fontFiles, cssFile]
}
