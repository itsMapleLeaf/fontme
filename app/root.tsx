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
  Scripts,
  useCatch,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import { FontDict, loadFonts } from "~/modules/fonts/api.server"
import { FontList, FontListFallback } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"
import { SelectedFonts } from "./modules/fonts/selected-fonts"
import { MaxWidthContainer } from "./modules/ui/max-width-container"
import { RaisedPanel } from "./modules/ui/raised-panel"
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
      className="overflow-y-scroll bg-base-300 text-base-content"
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

  return (
    <Document>
      <LeftSidebar>
        <RaisedPanel rounded={false} fullHeight>
          <Deferred value={fonts} fallback={<p>Loading...</p>}>
            {(fonts) => <SelectedFonts fonts={fonts} />}
          </Deferred>
        </RaisedPanel>
      </LeftSidebar>

      <div className="pl-80 -z-10">
        <header className="sticky top-0 z-10 py-4 shadow-md bg-base-200">
          <MaxWidthContainer>
            <nav className="flex items-center gap-6">
              <h1 className="text-3xl">fontme</h1>
              <div className="flex-1">
                <SearchForm paramName={searchParamName} />
              </div>
            </nav>
          </MaxWidthContainer>
        </header>

        <main className="py-4">
          <MaxWidthContainer>
            <Deferred value={fonts} fallback={<FontListFallback />}>
              {(fonts) => <FontList fonts={fonts} searchQuery={searchQuery} />}
            </Deferred>
          </MaxWidthContainer>
        </main>
      </div>
    </Document>
  )
}

function LeftSidebar({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-y-0 left-0">{children}</div>
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
