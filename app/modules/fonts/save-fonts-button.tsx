import { CheckCircleIcon, DocumentDownloadIcon } from "@heroicons/react/solid"
import { useSearchParams } from "@remix-run/react"
import { useFsAccessSupported } from "../dom/fs-access"
import { useAsync } from "../state/use-async"
import { useTimer } from "../state/use-timer"
import { Button } from "../ui/button"
import { FontContext, getFontFiles } from "./font-context"

export function SaveFontsButton({ context }: { context: FontContext }) {
  const successTimer = useTimer(1000)
  const [params] = useSearchParams()
  const fsAccessSupported = useFsAccessSupported()

  const [state, saveFonts] = useAsync(
    async () => {
      const directory = await window.showDirectoryPicker({
        mode: "readwrite",
      })

      const fontFiles = getFontFiles(context, window.location.origin)

      await Promise.all(
        fontFiles.map(async ({ name, data }) => {
          const file = await directory.getFileHandle(name, { create: true })
          const writable = await file.createWritable()
          await writable.write(await data)
          await writable.close()
        }),
      )
    },
    { onSuccess: successTimer.start, onError: console.error },
  )

  return (
    <div className="grid gap-4">
      {state.status === "error" && (
        <p role="alert" className="text-center text-error">
          Oops, something went wrong. Try again.
        </p>
      )}
      {fsAccessSupported ? (
        <Button
          icon={
            successTimer.running ? (
              <CheckCircleIcon className="w-6 text-success" />
            ) : (
              <DocumentDownloadIcon className="w-6" />
            )
          }
          label={successTimer.running ? "Saved!" : "Save fonts"}
          loading={state.status === "loading"}
          disabled={state.status === "loading"}
          onClick={saveFonts}
        />
      ) : (
        <Button
          icon={<DocumentDownloadIcon className="w-6" />}
          label="Save fonts"
          renderContainer={Button.renderRouterLink({
            to: `/api/fonts.zip?${params}`,
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        />
      )}
    </div>
  )
}
