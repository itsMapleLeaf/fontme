import { TrashIcon } from "@heroicons/react/solid"
import { Button } from "../ui/button"
import { FontContext } from "./font-context"

export function ClearSelectedFontsButton({
  context,
}: {
  context: FontContext
}) {
  return (
    <Button
      label="Clear selected"
      icon={<TrashIcon className="w-6" />}
      renderContainer={Button.renderRouterLink({
        to: context.getClearSelectionLink(),
      })}
    />
  )
}
