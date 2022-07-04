import { DocumentDownloadIcon } from "@heroicons/react/solid"
import { Button } from "../ui/button"

export function SaveFontsButton() {
  return (
    <Button
      icon={<DocumentDownloadIcon className="w-6" />}
      label="Save fonts"
    />
  )
}
