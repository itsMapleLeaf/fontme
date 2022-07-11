import { Dialog, Transition } from "@headlessui/react"
import { QuestionMarkCircleIcon } from "@heroicons/react/solid"
import { Deferrable, deferred, LoaderFunction } from "@remix-run/node"
import {
  Deferred,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { Fragment, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { useWindowSize } from "~/modules/dom/use-window-size"
import { ClearSelectedFontsButton } from "~/modules/fonts/clear-selected-fonts-button"
import { makeFontContext } from "~/modules/fonts/font-context"
import { FontCard } from "~/modules/fonts/font-list"
import { FontDict, loadFonts } from "~/modules/fonts/load-fonts.server"
import { pangrams } from "~/modules/fonts/pangrams"
import { SaveFontsButton } from "~/modules/fonts/save-fonts-button"
import { SelectedFont } from "~/modules/fonts/selected-font"
import { makeSearchContext } from "~/modules/search/search-context"
import { Button } from "~/modules/ui/button"
import { MaxWidthContainer } from "~/modules/ui/max-width-container"
import { RaisedPanel } from "~/modules/ui/raised-panel"
import { SearchForm } from "~/modules/ui/search-form"
import { getVisited, setVisited } from "~/modules/visited.server"

type LoaderData = {
  fonts: Deferrable<FontDict>
  pangrams: string[]
  firstVisit: boolean
}

export const loader: LoaderFunction = async ({ request }) => {
  const firstVisit = (await getVisited(request)) !== true

  return setVisited(
    deferred<LoaderData>({ fonts: loadFonts(), pangrams, firstVisit }),
  )
}

// don't ever reload this data; it's huge and rarely changes
export const unstable_shouldReload = () => false

export default function Index() {
  const { fonts, pangrams } = useLoaderData<LoaderData>()
  const [params] = useSearchParams()
  const searchContext = makeSearchContext(params)
  const navigate = useNavigate()
  const { height } = useWindowSize()

  return (
    <div className="isolate">
      <LeftSidebar>
        <RaisedPanel rounded={false} fullHeight>
          <section
            aria-label="Font selections"
            className="flex flex-col h-full gap-4 p-4 overflow-y-auto w-80"
          >
            <Deferred
              value={fonts}
              fallback={<EmptyState>Loading...</EmptyState>}
            >
              {(fonts) => {
                const context = makeFontContext(fonts, params)
                return context.selectedFontList.length > 0 ? (
                  <>
                    {context.selectedFontList.map((font) => (
                      <SelectedFont
                        key={font.family}
                        font={font}
                        context={context}
                      />
                    ))}
                    <div className="flex-1" />
                    <SaveFontsButton context={context} />
                    <ClearSelectedFontsButton context={context} />
                  </>
                ) : (
                  <>
                    <div className="my-auto">
                      <EmptyState>
                        Choose some fonts, and they'll appear here.
                      </EmptyState>
                    </div>
                  </>
                )
              }}
            </Deferred>
            <HelpModalButton />
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
              fallback={<EmptyState>Loading...</EmptyState>}
            >
              {(fonts) => {
                const context = makeFontContext(fonts, params)

                const list = searchContext.searchQuery
                  ? matchSorter(context.fontList, searchContext.searchQuery, {
                      keys: ["family"],
                    })
                  : context.fontList

                return list.length > 0 ? (
                  <div className="-my-2">
                    <Virtuoso
                      useWindowScroll
                      data={list}
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
                ) : (
                  <EmptyState>Couldn't find anything :(</EmptyState>
                )
              }}
            </Deferred>
          </MaxWidthContainer>
        </main>
      </div>
    </div>
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

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-2xl italic font-light text-center font-condensed opacity-70">
      {children}
    </p>
  )
}

function HelpModalButton() {
  const { firstVisit } = useLoaderData<LoaderData>()
  const [visible, setVisible] = useState(firstVisit)

  return (
    <>
      <Button
        variant="ghost"
        label="Help"
        icon={<QuestionMarkCircleIcon className="w-6" />}
        onClick={() => setVisible(true)}
      />

      <Transition show={visible} as={Fragment} appear>
        <Dialog onClose={setVisible}>
          <Transition.Child
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Dialog.Panel className="m-auto">
                <RaisedPanel>
                  <div className="grid max-w-screen-sm gap-4 p-4">
                    <Dialog.Title className="text-3xl font-light text-center font-condensed">
                      hi there!
                    </Dialog.Title>
                    <Dialog.Description as="div" className="grid gap-4">
                      <p>
                        fontme generates .woff2 files and the necessary CSS to
                        host the fonts on your website. This can be faster than
                        using Google's CDN, and you avoid sending data to their
                        servers!
                      </p>
                      <p>
                        Search for the fonts and variants you want to use, then
                        click "Save fonts" and choose the folder you want to
                        download them to.
                      </p>
                    </Dialog.Description>
                    <div className="text-center">
                      <Button
                        label="Thanks!"
                        onClick={() => setVisible(false)}
                      />
                    </div>
                  </div>
                </RaisedPanel>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
