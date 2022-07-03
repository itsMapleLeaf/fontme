import { DocumentDownloadIcon, TrashIcon, XIcon } from "@heroicons/react/solid"
import { Link, useSearchParams } from "@remix-run/react"
import { FontDict } from "~/modules/fonts/api.server"
import { FontSelector } from "~/modules/fonts/font-selector"
import { compactParams } from "../dom/compact-params"
import { Button } from "../ui/button"

export function SelectedFonts({ fonts }: { fonts: FontDict }) {
  const [params] = useSearchParams()

  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")
  const selectedVariantCount = Object.values(selector.selections).flat().length
  const hasSelections = selectedVariantCount > 0

  function getClearSelectedLink() {
    const newParams = new URLSearchParams(params)
    newParams.delete("fonts")
    return `?${newParams.toString()}`
  }

  const selectedFontList = Object.entries(selector.selections).map(
    ([family, variants]) => (
      <div
        key={family}
        className="flex flex-col gap-2 p-4 rounded-md bg-base-200"
      >
        <div className="flex items-center justify-between -mr-2">
          <h2 className="text-xl">{family}</h2>
          <Button
            label={<span className="sr-only">Remove</span>}
            icon={<XIcon className="w-5" />}
            size="sm"
            variant="ghost"
            shape="circle"
          />
        </div>
        {variants.map((name) => {
          const variant = fonts.families[family]?.variants[name]
          return (
            <div className="flex items-center justify-between -mr-2">
              <p key={name} className="opacity-70">
                {variant ? `${variant.style} ${variant.weight}` : name}
              </p>
              <Button
                label={<span className="sr-only">Remove</span>}
                icon={<XIcon className="w-5" />}
                size="sm"
                variant="ghost"
                shape="circle"
                renderContainer={Button.renderRouterLink({
                  to: `?${compactParams({
                    ...params,
                    fonts: selector.deselect(family, name).toParamString(),
                  })}`,
                })}
              />
            </div>
          )
        })}
      </div>
    ),
  )

  return (
    <div className="flex flex-col h-full gap-4 p-4 w-80">
      {hasSelections ? (
        <>
          <div className="flex flex-col flex-1 min-h-0 gap-4 overflow-y-auto">
            {selectedFontList}
          </div>
          <Link to={getClearSelectedLink()} className="gap-2 btn">
            <TrashIcon className="w-6" /> Clear selected
          </Link>
          <button type="button" className="gap-2 btn">
            <DocumentDownloadIcon className="w-6" /> Save fonts
          </button>
        </>
      ) : (
        <p className="flex flex-col justify-center h-full text-xl italic text-center opacity-50">
          Select some fonts to start.
        </p>
      )}
    </div>
  )
}
