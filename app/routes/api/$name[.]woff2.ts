import { LoaderFunction } from "@remix-run/node"
import { compress } from "wawoff2"
import { logPromiseTime } from "~/modules/common/log-promise-time"

export const loader: LoaderFunction = async ({ request }) => {
  const fontUrl = new URL(request.url).searchParams.get("url")
  if (!fontUrl) {
    throw new Response(undefined, {
      status: 400,
      statusText: "No font url provided",
    })
  }

  const input = await logPromiseTime(
    "fetch font",
    fetch(fontUrl).then((response) => response.arrayBuffer()),
  )
  const output = await logPromiseTime(
    "compress font",
    compress(Buffer.from(input)),
  )

  return new Response(output, {
    headers: {
      "Content-Type": "application/font-woff2",
    },
  })
}
