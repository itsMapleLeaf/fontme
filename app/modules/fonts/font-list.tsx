import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid"
import { useSearchParams, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { matchSorter } from "match-sorter"
import { Virtuoso } from "react-virtuoso"
import {
  FontDict,
  FontVariant,
  FontVariantRecord,
} from "~/modules/fonts/api.server"
import { FontSelector } from "~/modules/fonts/font-selector"
import { Collapse, CollapseHeaderProps } from "~/modules/ui/collapse"
import { useFontLoader } from "./font-loader"

export function FontList({
  fonts,
  searchQuery,
}: {
  fonts: FontDict
  searchQuery: string
}) {
  const familyNames = searchQuery
    ? matchSorter(fonts.familyNames, searchQuery)
    : fonts.familyNames

  return (
    <Virtuoso
      className="w-full h-full"
      style={{ transform: "translateZ(0)" }}
      initialItemCount={30}
      totalCount={familyNames.length}
      overscan={500}
      cellSpacing={12}
      itemContent={(index) => {
        const familyName = familyNames[index]
        const font = familyName && fonts.families[familyName]
        if (!font) return null
        return (
          <div className="mb-1 px-3">
            <FontItem family={familyName} variants={font.variants} />
          </div>
        )
      }}
    />
  )
}

export function FontListFallback() {
  return <p className="p-3 text-center opacity-50">Loading...</p>
}

function FontItem({
  family,
  variants,
}: {
  family: string
  variants: FontVariantRecord
}) {
  const styleRank = (style: string) =>
    style === "number" ? 0 : style === "italic" ? 1 : 2

  return (
    <Collapse
      stateKey={`font-item:${family}`}
      header={(props) => <FontItemHeader {...props} family={family} />}
    >
      <div className="px-3 space-y-1 mt-1">
        {Object.entries(variants)
          .sort((a, b) => a[1].weight.localeCompare(b[1].weight))
          .sort((a, b) => styleRank(b[1].style) - styleRank(a[1].style))
          .map(([name, variant]) => (
            <FontItemVariant
              key={name}
              family={family}
              variant={variant}
              variantName={name}
            />
          ))}
      </div>
    </Collapse>
  )
}

function FontItemHeader({
  family,
  visible,
  toggle,
}: { family: string } & CollapseHeaderProps) {
  const [params] = useSearchParams()
  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")

  return (
    <button
      type="button"
      className="flex w-full items-center py-2 hover:bg-base-200 rounded-md transition text-lg"
      onClick={toggle}
    >
      {visible ? (
        <ChevronDownIcon className="w-6" />
      ) : (
        <ChevronRightIcon className="w-6" />
      )}
      <FontPreviewText
        family={family}
        variant={{ weight: "400", style: "normal" }}
      />
      <CheckCircleIcon
        className={clsx(
          "text-info/50 w-6 ml-auto transition-opacity",
          selector.isFamilySelected(family) ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  )
}

function FontItemVariant({
  family,
  variantName,
  variant,
}: {
  family: string
  variantName: string
  variant: FontVariant
}) {
  const [params, setParams] = useSearchParams()
  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")

  const transition = useTransition()
  const pendingSelector = transition.location
    ? FontSelector.fromParamString(
        new URLSearchParams(transition.location.search).get("fonts") ?? "",
      )
    : undefined

  // checking the transition selections for optimistic UI
  const isChecked =
    pendingSelector?.isVariantSelected(family, variantName) ??
    selector.isVariantSelected(family, variantName)

  return (
    <label className="flex gap-2 items-center cursor-pointer hover:bg-base-200 focus:bg-base-200 rounded-md p-2 leading-none transition select-none">
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={(event) => {
          const newSelector = event.target.checked
            ? selector.select(family, variantName)
            : selector.deselect(family, variantName)

          const fontsParam = newSelector.toParamString()

          const newParams = new URLSearchParams(params)
          if (fontsParam) {
            newParams.set("fonts", fontsParam)
          } else {
            newParams.delete("fonts")
          }
          setParams(newParams)
        }}
      />
      <div className="flex flex-col gap-1">
        <FontPreviewText family={family} variant={variant} />
        <span className="text-sm opacity-50">
          {variant.style} {variant.weight}
        </span>
      </div>
    </label>
  )
}

function FontPreviewText({
  family,
  variant,
}: {
  family: string
  variant: { weight: string; style: string }
}) {
  const loadStatus = useFontLoader(family, variant)
  return (
    <span
      style={{
        fontFamily: family,
        fontWeight: variant.weight,
        fontStyle: variant.style,
      }}
      className={clsx(
        "transition duration-200 ease-out",
        loadStatus === "loaded" ? "opacity-100" : "opacity-0 translate-x-2",
      )}
    >
      {family}
    </span>
  )
}
