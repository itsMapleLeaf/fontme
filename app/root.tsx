import {
  Deferrable,
  deferred,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import {
  Deferred,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import { Font, loadFonts } from "~/modules/fonts/api.server"
import { FontList, FontListFallback } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"
import tailwind from "./tailwind.css"

const searchParamName = "search"

type LoaderData = {
  fonts: Deferrable<Font[]>
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
      className="bg-base-300 text-base-content"
      data-theme="night"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
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

  return (
    <Document>
      <div className="fixed inset-0 flex">
        <nav className="bg-base-100 overflow-y-auto shadow-md flex flex-col content-start w-80">
          <div className="p-4">
            <SearchForm paramName={searchParamName} />
          </div>
          <div className="flex-1">
            <Deferred value={fonts} fallback={<FontListFallback />}>
              {(fonts) => <FontList fonts={fonts} searchQuery={searchQuery} />}
            </Deferred>
          </div>
        </nav>
        <main className="flex-1 min-w-0 p-4 overflow-y-auto">
          <Outlet />
        </main>
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
