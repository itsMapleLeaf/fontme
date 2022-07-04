import { XIcon } from "@heroicons/react/solid"
import { Button } from "../ui/button"
import { FontContext, FontListItem } from "./font-context"
import { FontPreviewText } from "./font-preview-text"

export function SelectedFont({
  font,
  context,
}: {
  font: FontListItem
  context: FontContext
}) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-md bg-base-200">
      <div className="flex items-center justify-between -mr-2">
        <h2 className="text-xl">
          <FontPreviewText
            family={font.family}
            variant={context.getDefaultPreviewVariant(font.family)}
            text={font.family}
          />
        </h2>
        <Button
          label={<span className="sr-only">Remove</span>}
          icon={<XIcon className="w-5" />}
          size="sm"
          variant="ghost"
          shape="circle"
          renderContainer={Button.renderRouterLink({
            to: context.getDeselectFamilyLink(font.family),
          })}
        />
      </div>
      {font.variants.map((variant) => (
        <div className="flex items-center justify-between -mr-2">
          <p className="opacity-70">
            <FontPreviewText
              family={font.family}
              variant={variant}
              text={`${variant.style} ${variant.weight}`}
            />
          </p>
          <Button
            label={<span className="sr-only">Remove</span>}
            icon={<XIcon className="w-5" />}
            size="sm"
            variant="ghost"
            shape="circle"
            renderContainer={Button.renderRouterLink({
              to: context.getDeselectVariantLink(font.family, variant.name),
            })}
          />
        </div>
      ))}
    </div>
  )
}
