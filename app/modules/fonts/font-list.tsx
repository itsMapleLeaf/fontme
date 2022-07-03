import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/solid"
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
import { Collapse } from "~/modules/ui/collapse"
import { compactParams } from "../dom/compact-params"
import { useFontLoader } from "./font-loader"
import { pangrams } from "./pangrams"

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
      useWindowScroll
      initialItemCount={30}
      data={familyNames}
      className="-my-2"
      overscan={800}
      itemContent={(index, familyName) => {
        const font = fonts.families[familyName]
        if (!font) return
        return (
          <div className="py-2">
            <FontItem
              family={familyName}
              variants={font.variants}
              previewText={pangrams[index % pangrams.length]!}
            />
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
  previewText,
}: {
  family: string
  variants: FontVariantRecord
  previewText: string
}) {
  const [params] = useSearchParams()
  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")

  const styleRank = (style: string) =>
    style === "number" ? 0 : style === "italic" ? 1 : 2

  return (
    <div className="rounded-md shadow-md bg-base-100 overflow-clip">
      <Collapse
        stateKey={`font-item:${family}`}
        header={(props) => (
          <button
            type="button"
            onClick={props.toggle}
            className="flex items-center w-full gap-4 p-4 text-left transition-colors border-2 border-transparent hover:bg-white/5 focus:outline-none focus-visible:border-neutral-focus "
          >
            <ChevronRightIcon
              className={clsx("w-6 -m-2", props.visible ? "rotate-90" : "")}
            />
            <div className="flex-1">
              <div className="text-sm opacity-70">{family}</div>
              <div className="text-xl">
                <FontPreviewText family={family} text={previewText} />
              </div>
            </div>
            {selector.isFamilySelected(family) && (
              <CheckCircleIcon className="w-6 opacity-50 text-success" />
            )}
          </button>
        )}
      >
        <div className="bg-base-200 grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
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
    </div>
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
    <label className="flex items-center gap-3 p-4 leading-none transition cursor-pointer select-none hover:bg-white/5 focus:outline-none">
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={(event) => {
          const newSelector = event.target.checked
            ? selector.select(family, variantName)
            : selector.deselect(family, variantName)

          const fontsParam = newSelector.toParamString()
          setParams(compactParams({ ...params, fonts: fontsParam }))
        }}
      />
      <div className="flex flex-col gap-1">
        <FontPreviewText
          family={family}
          variant={variant}
          text={`${variant.style} ${variant.weight}`}
        />
      </div>
    </label>
  )
}

function FontPreviewText({
  family,
  variant = { weight: "400", style: "normal" },
  text,
}: {
  family: string
  variant?: { weight: string; style: string }
  text: string
}) {
  const loadStatus = useFontLoader(family, variant, text)
  return (
    <span
      style={{
        fontFamily: family,
        fontWeight: variant.weight,
        fontStyle: variant.style,
      }}
      className={clsx(
        "transition duration-200 ease-out",
        loadStatus === "loaded"
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-2",
      )}
    >
      {text}
    </span>
  )
}
