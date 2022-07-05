import { LoaderFunction } from "@remix-run/node"
import { toError } from "~/modules/common/error"
import { resultify } from "~/modules/common/result"

// execa is an ES module, and has a bunch of dependencies that are also ES modules
// this is the easiest way to consume it 🙃
const execaPromise = import("execa")

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

  const { execa } = await execaPromise

  // using a child process for better parallelism
  const [output, outputError] = await resultify(
    execa("bin/convert-to-woff2.mjs", { input: Buffer.from(input) }),
  )
  if (!output) {
    throw new Response(undefined, {
      status: 500,
      statusText: `Could not compress font: ${toError(outputError).message}`,
    })
  }

  return new Response(output.stdout, {
    headers: { "Content-Type": "application/font-woff2" },
  })
}
