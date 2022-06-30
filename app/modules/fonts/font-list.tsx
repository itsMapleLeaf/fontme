import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/solid"
import { useSearchParams, useTransition } from "@remix-run/react"
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
  return (
    <button
      className="text-left flex w-full items-center py-2 hover:bg-base-200 rounded-md transition text-lg"
      onClick={toggle}
    >
      {visible ? (
        <ChevronDownIcon className="w-6" />
      ) : (
        <ChevronRightIcon className="w-6" />
      )}
      <span>{font.family}</span>
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
    pendingSelector?.isSelected(family, variant) ??
    selector.isSelected(family, variant)

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
          const newParams = event.target.checked
            ? selector.select(family, variant)
            : selector.deselect(family, variant)
          setParams({ ...params, fonts: newParams.toParamString() })
        }}
      />
      {variant}
    </label>
  )
}
