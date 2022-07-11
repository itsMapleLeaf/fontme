import { LoaderFunction } from "@remix-run/node"
import JSZip from "jszip"
import { getFontFiles, makeFontContext } from "~/modules/fonts/font-context"
import { loadFonts } from "~/modules/fonts/load-fonts.server"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)

  const files = getFontFiles(
    makeFontContext(await loadFonts(), url.searchParams),
    url.origin,
  )

  const zip = new JSZip()

  await Promise.all(
    files.map(async ({ name, data }) => {
      zip.file(name, await data)
    }),
  )

  return new Response(await zip.generateAsync({ type: "blob" }), {
    headers: { "Content-Type": "application/zip" },
  })
}
