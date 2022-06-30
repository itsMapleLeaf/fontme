import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid"
import { useSearchParams, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { Virtuoso } from "react-virtuoso"
import { FontSelector } from "~/modules/font-selection"
import { Font } from "~/modules/fonts/api.server"
import { Collapse, CollapseHeaderProps } from "~/modules/ui/collapse"

export function FontList({ fonts }: { fonts: Font[] }) {
  return (
    <Virtuoso
      className="w-full h-full"
      style={{ transform: "translateZ(0)" }}
      initialItemCount={30}
      totalCount={fonts.length}
      overscan={20}
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

function FontItem({ font }: { font: Font }) {
  return (
    <Collapse
      stateKey={`font-item:${font.family}`}
      header={(props) => <FontItemHeader {...props} font={font} />}
    >
      <div className="px-3 space-y-1 mt-2">
        {font.variants.map((variant) => (
          <FontItemVariant
            key={variant}
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
      <span>{font.family}</span>
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
  variant: string
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
    pendingSelector?.isVariantSelected(family, variant) ??
    selector.isVariantSelected(family, variant)

  return (
    <label
      key={variant}
      className="flex gap-2 items-center cursor-pointer hover:bg-base-200 focus:bg-base-200 rounded-md p-2 leading-none transition select-none"
    >
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={(event) => {
          const newSelector = event.target.checked
            ? selector.select(family, variant)
            : selector.deselect(family, variant)

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
      {variant}
    </label>
  )
}
