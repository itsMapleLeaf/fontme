import { DocumentDownloadIcon } from "@heroicons/react/solid"
import { Button } from "../ui/button"
import { FontContext } from "./font-context"

export function SaveFontsButton({ context }: { context: FontContext }) {
  const saveFonts = async () => {
    try {
      const directory = await window.showDirectoryPicker({
        mode: "readwrite",
      })

      const selectedVariants = context.selectedFontList.flatMap((font) =>
        font.variants.map((variant) => ({ font, variant })),
      )

      const fontFiles = selectedVariants.map(({ font, variant }) => {
        const normalizedFamily = font.family.replaceAll(" ", "-")
        const fileName = `${normalizedFamily}-${variant.weight}-${variant.style}.woff2`

        const data = fetch(`/api/${fileName}.woff2?url=${variant.url}`).then(
          (response) => response.blob(),
        )

        return { font, variant, name: fileName, data }
      })

      const cssFile = {
        name: "fonts.css",
        data: fontFiles
          .map(
            ({ font, variant, name }) => css`
              @font-face {
                font-family: "${font.family}";
                font-style: ${variant.style};
                font-weight: ${variant.weight};
                src: url("./${name}") format("woff2");
              }
            `,
          )
          .join("\n\n"),
      }

      await Promise.all(
        [...fontFiles, cssFile].map(async ({ name, data }) => {
          const file = await directory.getFileHandle(name, { create: true })
          const writable = await file.createWritable()
          await writable.write(await data)
          await writable.close()
        }),
      )
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Button
      icon={<DocumentDownloadIcon className="w-6" />}
      label="Save fonts"
      onClick={saveFonts}
    />
  )
}

const css = (constants: TemplateStringsArray, ...variables: unknown[]) => {
  let result = []
  for (let i = 0; i < constants.length; i++) {
    result.push(constants[i])
    if (i < variables.length) {
      result.push(variables[i])
    }
  }
  return result.join("")
}

declare global {
  interface Window {
    showDirectoryPicker: (options: {
      mode?: "read" | "readwrite"
    }) => Promise<Directory>
  }

  interface Directory {
    getFileHandle: (
      name: string,
      options?: { create?: boolean },
    ) => Promise<FileHandle>
  }

  interface FileHandle {
    createWritable: () => Promise<Writable>
  }

  type WritableData = BufferSource | Blob | string

  interface Writable {
    write: (data: WritableData) => Promise<void>
    close: () => Promise<void>
  }
}
