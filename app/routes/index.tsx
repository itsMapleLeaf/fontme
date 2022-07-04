import { Deferrable, deferred, LoaderFunction } from "@remix-run/node"
import {
  Deferred,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { Virtuoso } from "react-virtuoso"
import { useWindowSize } from "~/modules/dom/use-window-size"
import { FontDict, loadFonts } from "~/modules/fonts/api.server"
import { ClearSelectedFontsButton } from "~/modules/fonts/clear-selected-fonts-button"
import { makeFontContext } from "~/modules/fonts/font-context"
import { FontCard } from "~/modules/fonts/font-list"
import { pangrams } from "~/modules/fonts/pangrams"
import { SaveFontsButton } from "~/modules/fonts/save-fonts-button"
import { SelectedFont } from "~/modules/fonts/selected-font"
import { makeSearchContext } from "~/modules/search/search-context"
import { MaxWidthContainer } from "~/modules/ui/max-width-container"
import { RaisedPanel } from "~/modules/ui/raised-panel"
import { SearchForm } from "~/modules/ui/search-form"

type LoaderData = {
  fonts: Deferrable<FontDict>
  pangrams: string[]
}

export const loader: LoaderFunction = () =>
  deferred<LoaderData>({ fonts: loadFonts(), pangrams })

// don't ever reload this data; it's huge and rarely changes
export const unstable_shouldReload = () => false

export default function Index() {
  const { fonts, pangrams } = useLoaderData<LoaderData>()
  const [params] = useSearchParams()
  const searchContext = makeSearchContext(params)
  const navigate = useNavigate()
  const { height } = useWindowSize()

  return (
    <>
      <LeftSidebar>
        <RaisedPanel rounded={false} fullHeight>
          <section
            aria-label="Font selections"
            className="flex flex-col h-full gap-4 p-4 w-80"
          >
            <Deferred value={fonts} fallback={<p>Loading...</p>}>
              {(fonts) => {
                const context = makeFontContext(fonts, params)
                return (
                  <>
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
                  </>
                )
              }}
            </Deferred>
          </section>
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
            <Deferred
              value={fonts}
              fallback={
                <p className="p-3 text-center opacity-50">Loading...</p>
              }
            >
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
    </>
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
