import { DocumentDownloadIcon, TrashIcon } from "@heroicons/react/solid"
import {
  Deferrable,
  deferred,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import {
  Deferred,
  Link,
  Links,
  LiveReload,
  Meta,
  Scripts,
  useCatch,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import clsx from "clsx"
import { FontDict, loadFonts } from "~/modules/fonts/api.server"
import { FontList, FontListFallback } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"
import { FontSelector } from "./modules/fonts/font-selector"
import { MaxWidthContainer } from "./modules/ui/max-width-container"
import tailwind from "./tailwind.css"

const searchParamName = "search"

type LoaderData = {
  fonts: Deferrable<FontDict>
}

export const loader: LoaderFunction = () =>
  deferred<LoaderData>({ fonts: loadFonts() })

// don't ever reload this data; it's huge and rarely changes
export const unstable_shouldReload = () => false

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "fontme",
  description: "Generate optimized fonts and CSS for self-hosting Google Fonts",
  viewport: "width=device-width,initial-scale=1",
})

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
]

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="bg-base-300 text-base-content overflow-y-scroll"
      data-theme="dark"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        {/* <ScrollRestoration /> */}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  const { fonts } = useLoaderData<LoaderData>()

  const [params] = useSearchParams()
  const searchQuery = params.get(searchParamName) ?? ""
  const selector = FontSelector.fromParamString(params.get("fonts") ?? "")
  const selectedVariantCount = Object.values(selector.selections).flat().length

  function getClearSelectedLink() {
    const newParams = new URLSearchParams(params)
    newParams.delete("fonts")
    return `?${newParams.toString()}`
  }

  return (
    <Document>
      <div className="flex flex-col min-h-screen">
        <div className="bg-base-200 py-4 shadow-md sticky top-0 z-10">
          <MaxWidthContainer>
            <nav className="flex items-center gap-6">
              <h1 className="text-3xl">fontme</h1>
              <div className="flex-1">
                <SearchForm paramName={searchParamName} />
              </div>
            </nav>
          </MaxWidthContainer>
        </div>

        <main className="py-4">
          <MaxWidthContainer>
            <Deferred value={fonts} fallback={<FontListFallback />}>
              {(fonts) => <FontList fonts={fonts} searchQuery={searchQuery} />}
            </Deferred>
          </MaxWidthContainer>
        </main>

        <div
          className={clsx(
            "sticky bottom-0 bg-base-100 py-4 shadow-md transition mt-auto",
            selectedVariantCount > 0 ? "translate-y-0" : "translate-y-full",
          )}
        >
          <MaxWidthContainer>
            <footer className="flex items-center gap-4">
              <aside className="italic opacity-70">
                {selectedVariantCount} variants selected
              </aside>
              <div className="flex-1" />
              <Link to={getClearSelectedLink()} className="btn gap-2">
                <TrashIcon className="w-6" /> Clear selected
              </Link>
              <button type="button" className="btn gap-2">
                <DocumentDownloadIcon className="w-6" /> Save fonts
              </button>
            </footer>
          </MaxWidthContainer>
        </div>
      </div>
    </Document>
  )
}

export const CatchBoundary: CatchBoundaryComponent = (props) => {
  const response = useCatch()
  return (
    <Document>
      <main>
        <h1>oops, something went wrong</h1>
        <p>{response.statusText}</p>
      </main>
    </Document>
  )
}
