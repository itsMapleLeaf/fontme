import {
  CheckCircleIcon,
  ClipboardCopyIcon,
  DocumentDownloadIcon,
} from "@heroicons/react/solid"
import { DataFunctionArgs, LinksFunction } from "@remix-run/node"
import { useRef, useState } from "react"
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
        <div className="bg-base-200 flex">
          <button
            type="button"
            className="btn btn-ghost rounded-none gap-1"
            onClick={() => alert("this doesn't work yet lol")}
          >
            <DocumentDownloadIcon className="w-6" /> Download fonts
          </button>
          <CopyCssButton code={css.code} />
        </div>
      </div>
    </div>
  )
}

function CopyCssButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleClick = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 1000)
  }

  return (
    <button
      type="button"
      className="btn btn-ghost rounded-none gap-1"
      onClick={handleClick}
    >
      {copied ? (
        <>
          <CheckCircleIcon className="w-6 text-success" />
          Copied!
        </>
      ) : (
        <>
          <ClipboardCopyIcon className="w-6" />
          Copy CSS
        </>
      )}
    </button>
  )
}
