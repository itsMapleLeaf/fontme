import { LoaderFunction } from "@remix-run/node"
import { compress } from "wawoff2"

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
  const output = await compress(Buffer.from(input))

  return new Response(output, {
    headers: {
      "Content-Type": "application/font-woff2",
    },
  })
}
