import { LoaderFunction } from "@remix-run/node"
import { join } from "path"
import Piscina from "piscina"
import { pathToFileURL } from "url"

const worker = new Piscina({
  // starts from the root `build` folder
  filename: pathToFileURL(
    join(__dirname, "../app/modules/fonts/convert-to-woff2.worker.mjs"),
  ).href,
})

export const loader: LoaderFunction = async ({ request }) => {
  const fontUrl = new URL(request.url).searchParams.get("url")
  if (!fontUrl) {
    throw new Response(undefined, {
      status: 400,
      statusText: "No font url provided",
    })
  }

  const response = await fetch(fontUrl)
  const input = await response.arrayBuffer()
  const output: ArrayBuffer = await worker.run(input)

  return new Response(output, {
    headers: {
      "Content-Type": "application/font-woff2",
    },
  })
}
