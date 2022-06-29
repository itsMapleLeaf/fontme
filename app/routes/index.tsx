import { SearchIcon } from "@heroicons/react/solid"
import { DataFunctionArgs, Deferrable, deferred } from "@remix-run/node"
import {
  Deferred,
  Form,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { useMemo } from "react"
import { debounce } from "~/modules/common/debounce"
import { Font, loadFonts } from "~/modules/gfonts/api.server"

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
      <section className="bg-base-100 overflow-y-auto shadow-md p-4 flex flex-col content-start w-72">
        <SearchForm />
        <div className="flex-1 mt-3">
          <Deferred value={fonts} fallback={<p>Loading...</p>}>
            {(fonts) => <FontList fonts={fonts} />}
          </Deferred>
        </div>
      </section>
      <section className="flex-1 min-w-0 p-4">
        <div className="bg-base-100 rounded-md p-4 shadow-md">test</div>
      </section>
    </main>
  )
}

function FontList({ fonts }: { fonts: Font[] }) {
  return (
    <div className="h-full w-full flex flex-col gap-3">
      {fonts.map((font) => (
        <p key={font.family}>{font.family}</p>
      ))}
    </div>
  )
}

function SearchForm() {
  const [params, setParams] = useSearchParams()

  const setParamsDebounced = useMemo(
    () => debounce(setParams, 500),
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
          setParamsDebounced(newParams)
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
