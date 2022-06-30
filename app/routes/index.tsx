import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@heroicons/react/solid"
import { DataFunctionArgs, Deferrable, deferred } from "@remix-run/node"
import {
  Deferred,
  Form,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { useMemo } from "react"
import { Virtuoso } from "react-virtuoso"
import { debounce } from "~/modules/common/debounce"
import { useFontSelection } from "~/modules/font-selection"
import { Font, loadFonts } from "~/modules/gfonts/api.server"
import { Collapse, CollapseHeaderProps } from "~/modules/ui/collapse"

type LoaderData = {
  fonts: Deferrable<Font[]>
}

export async function loader({ request }: DataFunctionArgs) {
  const params = new URL(request.url).searchParams
  const searchQuery = params.get("search")

  return deferred<LoaderData>({
    fonts: loadFonts().then((fonts) => {
      if (!searchQuery) return fonts
      return matchSorter(fonts, searchQuery, {
        keys: ["family", "category", "subsets", "variants"],
      })
    }),
  })
}

export default function Index() {
  const { fonts } = useLoaderData<LoaderData>()
  return (
    <main className="fixed inset-0 flex">
      <Deferred value={fonts} fallback={<p>Loading...</p>}>
        {(fonts) => <FontList fonts={fonts} />}
      </Deferred>
      <section className="flex-1 min-w-0 p-4">
        <div className="bg-base-100 rounded-md p-4 shadow-md">
          <FontCss />
        </div>
      </section>
    </main>
  )
}

function FontCss() {
  const { selections } = useFontSelection()
  return <pre>{JSON.stringify(selections, undefined, 2)}</pre>
}

function FontList({ fonts }: { fonts: Font[] }) {
  return (
    <section className="bg-base-100 overflow-y-auto shadow-md flex flex-col content-start w-72">
      <div className="p-4">
        <SearchForm />
      </div>
      <Virtuoso
        className="flex-1 w-full"
        style={{ transform: "translateZ(0)" }}
        initialItemCount={30}
        totalCount={fonts.length}
        overscan={20}
        cellSpacing={12}
        itemContent={(index) => {
          const font = fonts[index]
          return (
            <div className="mb-1 px-3">{font && <FontItem font={font} />}</div>
          )
        }}
      />
    </section>
  )
}

function SearchForm() {
  const [params, setParams] = useSearchParams()

  const setParamsDebounced = useMemo(
    () => debounce(setParams, 300),
    [setParams],
  )

  return (
    <Form className="relative">
      <input
        className="input input-bordered w-full pr-10"
        name="search"
        placeholder="Search..."
        defaultValue={params.get("search") ?? ""}
        onChange={(event) => {
          const newParams = new URLSearchParams(params)
          if (event.target.value) {
            newParams.set("search", event.target.value)
          } else {
            newParams.delete("search")
          }
          setParamsDebounced(newParams, { replace: true })
        }}
      />
      <button
        type="submit"
        className="btn btn-ghost p-3 absolute right-0 inset-y-0"
        title="Submit"
      >
        <SearchIcon className="w-5" />
      </button>
    </Form>
  )
}

function FontItem({ font }: { font: Font }) {
  return (
    <Collapse
      stateKey={`font-item:${font.family}`}
      header={(props) => <FontItemHeader {...props} font={font} />}
    >
      <div className="px-3 space-y-1 mt-2">
        {font.variants.map((variant) => (
          <FontItemVariant
            key={variant}
            family={font.family}
            variant={variant}
          />
        ))}
      </div>
    </Collapse>
  )
}

function FontItemHeader({
  font,
  visible,
  toggle,
}: { font: Font } & CollapseHeaderProps) {
  return (
    <button
      className="text-left flex w-full items-center py-2 hover:bg-base-200 rounded-md transition text-lg"
      onClick={toggle}
    >
      {visible ? (
        <ChevronDownIcon className="w-6" />
      ) : (
        <ChevronRightIcon className="w-6" />
      )}
      <span>{font.family}</span>
    </button>
  )
}

function FontItemVariant({
  family,
  variant,
}: {
  family: string
  variant: string
}) {
  const selections = useFontSelection()

  return (
    <label
      key={variant}
      className="flex gap-2 items-center cursor-pointer hover:bg-base-200 focus:bg-base-200 rounded-md p-2 leading-none transition select-none"
    >
      <input
        type="checkbox"
        className="checkbox"
        checked={selections.isSelected(family, variant)}
        onChange={(event) => {
          if (event.target.checked) {
            selections.select(family, variant)
          } else {
            selections.deselect(family, variant)
          }
        }}
      />
      {variant}
    </label>
  )
}
