import { DataFunctionArgs } from "@remix-run/node"
import { jsonTyped, useLoaderDataTyped } from "remix-typed"
import { FontSelector } from "~/modules/fonts/font-selector"
import { generateFontCss } from "~/modules/fonts/generate-font-css"

export function loader({ request }: DataFunctionArgs) {
  const { searchParams } = new URL(request.url)
  const selector = FontSelector.fromParamString(searchParams.get("fonts") ?? "")
  return jsonTyped({
    css: generateFontCss(selector),
  })
}

export default function Index() {
  const { css } = useLoaderDataTyped<typeof loader>()
  return (
    <div className="p-4 grid gap-4">
      <pre className="bg-base-100 rounded-md p-4 shadow-md whitespace-pre-wrap">
        {css}
      </pre>
    </div>
  )
}
