import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/solid"
import { useNavigate } from "@remix-run/react"
import clsx from "clsx"
import { Collapse } from "~/modules/ui/collapse"
import { FontContext, FontListItem, VariantListItem } from "./font-context"
import { FontPreviewText } from "./font-preview-text"

export function FontCard({
  font,
  context,
  previewText,
}: {
  font: FontListItem
  context: FontContext
  previewText: string
}) {
  return (
    <div className="rounded-md shadow-md bg-base-100 overflow-clip">
      <Collapse
        stateKey={`font:${font.family}`}
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
              <div className="text-sm opacity-70">{font.family}</div>
              <div className="text-xl">
                <FontPreviewText
                  family={font.family}
                  variant={context.getDefaultPreviewVariant(font.family)}
                  text={previewText}
                />
              </div>
            </div>
            {Object.values(font.variants).some((v) => v.selected) && (
              <CheckCircleIcon className="w-6 opacity-50 text-success" />
            )}
          </button>
        )}
      >
        <div className="bg-base-200 grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
          {font.variants.map((variant) => (
            <FontItemVariant
              key={variant.name}
              family={font.family}
              variant={variant}
              context={context}
            />
          ))}
        </div>
      </Collapse>
    </div>
  )
}

function FontItemVariant({
  family,
  variant,
  context,
}: {
  family: string
  variant: VariantListItem
  context: FontContext
}) {
  const navigate = useNavigate()
  return (
    <label className="flex items-center gap-3 p-4 leading-none transition cursor-pointer select-none hover:bg-white/5 focus:outline-none">
      <input
        type="checkbox"
        className="checkbox"
        checked={variant.selected}
        onChange={(event) => {
          navigate(
            event.target.checked
              ? context.getSelectVariantLink(family, variant.name)
              : context.getDeselectVariantLink(family, variant.name),
          )
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
