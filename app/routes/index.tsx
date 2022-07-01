import { DataFunctionArgs, LinksFunction } from "@remix-run/node"
import { jsonTyped, useLoaderDataTyped } from "remix-typed"
import { FontSelector } from "~/modules/fonts/font-selector"
import { generateFontCss } from "~/modules/fonts/generate-font-css.server"
import hljsTheme from "../../node_modules/highlight.js/styles/base16/tomorrow-night.css"

export async function loader({ request }: DataFunctionArgs) {
  const { searchParams } = new URL(request.url)
  const selector = FontSelector.fromParamString(searchParams.get("fonts") ?? "")
  return jsonTyped({
    css: await generateFontCss(selector),
  })
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: hljsTheme },
]

export default function Index() {
  const { css } = useLoaderDataTyped<typeof loader>()
  return (
    <div className="p-4 grid gap-4">
      <div className="bg-base-100 rounded-md shadow-md overflow-clip">
        <pre
          className="overflow-auto p-4 max-h-[50rem]"
          dangerouslySetInnerHTML={css}
        />
      </div>
    </div>
  )
}
