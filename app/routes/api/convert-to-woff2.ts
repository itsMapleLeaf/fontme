import { LoaderFunction } from "@remix-run/node"
import { compress } from "wawoff2"
import { toError } from "~/modules/common/error"
import { resultify } from "~/modules/common/result"

export const loader: LoaderFunction = async ({ request }) => {
  const fontUrl = new URL(request.url).searchParams.get("url")
  if (!fontUrl) {
    throw new Response(undefined, {
      status: 400,
      statusText: "No font url provided",
    })
  }

  const [input, inputError] = await resultify(
    fetch(fontUrl).then((r) => r.arrayBuffer()),
  )
  if (!input) {
    throw new Response(undefined, {
      status: 500,
      statusText: `Could not fetch font: ${toError(inputError).message}`,
    })
  }

  const [output, outputError] = await resultify(compress(Buffer.from(input)))
  if (!output) {
    throw new Response(undefined, {
      status: 500,
      statusText: `Could not compress font: ${toError(outputError).message}`,
    })
  }

  return new Response(output, {
    headers: { "Content-Type": "application/font-woff2" },
  })
}
