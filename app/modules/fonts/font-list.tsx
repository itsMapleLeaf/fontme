import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid"
import { useSearchParams, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { matchSorter } from "match-sorter"
import { useEffect, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { FontSelector } from "~/modules/font-selection"
import { Font, FontVariant } from "~/modules/fonts/api.server"
import { Collapse, CollapseHeaderProps } from "~/modules/ui/collapse"

export function FontList({
  fonts,
  searchQuery,
}: {
  fonts: Font[]
  searchQuery: string
}) {
  if (searchQuery) {
    fonts = matchSorter(fonts, searchQuery, { keys: ["family"] })
  }
  return (
    <Virtuoso
      className="w-full h-full"
      style={{ transform: "translateZ(0)" }}
      initialItemCount={30}
      totalCount={fonts.length}
      overscan={500}
      cellSpacing={12}
      itemContent={(index) => {
        const font = fonts[index]
        return (
          <div className="mb-1 px-3">{font && <FontItem font={font} />}</div>
        )
      }}
    />
  )
}

export function FontListFallback() {
  return <p className="p-3 text-center opacity-50">Loading...</p>
}

function FontItem({ font }: { font: Font }) {
  return (
    <Collapse
      stateKey={`font-item:${font.family}`}
      header={(props) => <FontItemHeader {...props} font={font} />}
    >
      <div className="px-3 space-y-1 mt-2">
        {font.variants.map((variant) => (
          <FontItemVariant
            key={variant.name}
            family={font.family}
            variant={variant}
          />
        ))}
      </div>
    </Collapse>
  )
}

function FontItemHeader({
  font,
  visible,
  toggle,
}: { font: Font } & CollapseHeaderProps) {
  const [params] = useSearchParams()
  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")
  const loaded = useFontLoader(font.family, { weight: "400", style: "normal" })

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
      <span
        style={{ fontFamily: font.family }}
        className={clsx(
          "transition ease-out",
          loaded ? "opacity-100" : "opacity-0 translate-x-2",
        )}
      >
        {font.family}
      </span>
      <CheckCircleIcon
        className={clsx(
          "text-primary/50 w-6 ml-auto transition-opacity",
          selector.isFamilySelected(font.family) ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  )
}

function FontItemVariant({
  family,
  variant,
}: {
  family: string
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
    pendingSelector?.isVariantSelected(family, variant.name) ??
    selector.isVariantSelected(family, variant.name)

  const loaded = useFontLoader(family, variant)

  return (
    <label className="flex gap-2 items-center cursor-pointer hover:bg-base-200 focus:bg-base-200 rounded-md p-2 leading-none transition select-none">
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={(event) => {
          const newSelector = event.target.checked
            ? selector.select(family, variant.name)
            : selector.deselect(family, variant.name)

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
      <span
        style={{
          fontFamily: family,
          fontWeight: variant.weight,
          fontStyle: variant.style,
        }}
        className={clsx(
          "transition duration-200 ease-out",
          loaded ? "opacity-100" : "opacity-0 translate-x-2",
        )}
      >
        {family}
      </span>
      <span className="ml-auto text-sm opacity-50 italic">{variant.name}</span>
    </label>
  )
}

function useFontLoader(
  family: string,
  { weight, style }: { weight: string; style: string },
) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const variantParam =
      style === "italic" ? `ital,wght@1,${weight}` : `wght@${weight}`

    const params = new URLSearchParams()
    params.set("family", `${family}:${variantParam}`)
    params.set("display", "block")
    params.set("text", family)

    const link = document.createElement("link")
    link.href = `https://fonts.googleapis.com/css2?${params}`
    link.rel = "stylesheet"

    link.addEventListener("error", () => setLoaded(true))

    let cancelled = false

    // when the stylesheet loads, the font itself may not have actually loaded yet,
    // so we have to wait until it does
    link.addEventListener("load", async () => {
      let loaded = false
      while (!loaded && !cancelled) {
        const result = await document.fonts.load(
          `${weight} ${style} 16px "${family}"`,
        )
        loaded = result.length > 0
      }
      setLoaded(true)
    })

    document.head.append(link)

    return () => {
      link.remove()
      cancelled = true
    }
  }, [family, weight, style])

  return loaded
}
