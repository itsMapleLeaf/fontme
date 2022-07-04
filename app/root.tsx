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
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import type { CatchBoundaryComponent } from "@remix-run/react/routeModules"
import { Virtuoso } from "react-virtuoso"
import { FontDict, loadFonts } from "~/modules/fonts/api.server"
import { FontCard, FontListFallback } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"
import { useWindowSize } from "./modules/dom/use-window-size"
import { ClearSelectedFontsButton } from "./modules/fonts/clear-selected-fonts-button"
import { makeFontContext } from "./modules/fonts/font-context"
import { pangrams } from "./modules/fonts/pangrams"
import { SaveFontsButton } from "./modules/fonts/save-fonts-button"
import { SelectedFont } from "./modules/fonts/selected-font"
import { makeSearchContext } from "./modules/search/search-context"
import { MaxWidthContainer } from "./modules/ui/max-width-container"
import { RaisedPanel } from "./modules/ui/raised-panel"
import tailwind from "./tailwind.css"

const searchParamName = "search"

type LoaderData = {
  fonts: Deferrable<FontDict>
  pangrams: string[]
}

export const loader: LoaderFunction = () =>
  deferred<LoaderData>({ fonts: loadFonts(), pangrams })

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
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  const { fonts, pangrams } = useLoaderData<LoaderData>()
  const [params] = useSearchParams()
  const searchContext = makeSearchContext(params)
  const navigate = useNavigate()
  const { height } = useWindowSize()

  return (
    <Document>
      <LeftSidebar>
        <RaisedPanel rounded={false} fullHeight>
          <Deferred value={fonts} fallback={<p>Loading...</p>}>
            {(fonts) => {
              const context = makeFontContext(fonts, params)
              return (
                <section
                  aria-label="Font selections"
                  className="flex flex-col h-full gap-4 p-4 w-80"
                >
                  {context.selectedFontList.map((font) => (
                    <SelectedFont
                      key={font.family}
                      font={font}
                      context={context}
                    />
                  ))}
                  <div className="flex-1" />
                  <ClearSelectedFontsButton context={context} />
                  <SaveFontsButton />
                </section>
              )
            }}
          </Deferred>
        </RaisedPanel>
      </LeftSidebar>

      <div className="pl-80 -z-10">
        <header className="sticky top-0 z-10 py-4 shadow-md bg-base-200">
          <MaxWidthContainer>
            <Header>
              <SearchForm
                name={searchContext.paramName}
                defaultValue={searchContext.searchQuery}
                onSubmit={(value) => {
                  navigate(searchContext.getSearchLink(value), {
                    replace: true,
                  })
                }}
              />
            </Header>
          </MaxWidthContainer>
        </header>

        <main className="py-4">
          <MaxWidthContainer>
            <Deferred value={fonts} fallback={<FontListFallback />}>
              {(fonts) => {
                const context = makeFontContext(fonts, params)
                return (
                  <div className="-my-2">
                    <Virtuoso
                      useWindowScroll
                      data={context.fontList}
                      overscan={height}
                      itemContent={(index, font) => (
                        <div className="py-2">
                          <FontCard
                            font={font}
                            context={context}
                            previewText={pangrams[index % pangrams.length]!}
                          />
                        </div>
                      )}
                    />
                  </div>
                )
              }}
            </Deferred>
          </MaxWidthContainer>
        </main>
      </div>
    </Document>
  )
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <nav className="flex items-center gap-6">
      <h1 className="text-3xl">fontme</h1>
      <div className="flex-1">{children}</div>
    </nav>
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
