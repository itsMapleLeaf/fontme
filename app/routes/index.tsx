import { SearchIcon } from "@heroicons/react/solid"
import type { DataFunctionArgs } from "@remix-run/node"
import { Form, useSearchParams } from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { useMemo } from "react"
import { jsonTyped, useLoaderDataTyped } from "remix-typed"
import { debounce } from "~/modules/common/debounce"
import { loadFonts } from "~/modules/gfonts/api.server"

export async function loader({ request }: DataFunctionArgs) {
  let fonts = (await loadFonts()).items

  const params = new URL(request.url).searchParams

  const searchQuery = params.get("search")
  if (searchQuery) {
    fonts = matchSorter(fonts, searchQuery, {
      keys: ["family", "category", "subsets", "variants"],
    })
  }

  return jsonTyped(fonts)
}

export default function Index() {
  const fonts = useLoaderDataTyped<typeof loader>()
  return (
    <main className="fixed inset-0 flex">
      <section className="bg-base-100 overflow-y-auto shadow-md p-4 grid gap-3 content-start w-72">
        <SearchForm />
        {fonts.map((font) => (
          <p key={font.family}>{font.family}</p>
        ))}
      </section>
      <section className="flex-1 min-w-0 p-4">
        <div className="bg-base-100 rounded-md p-4 shadow-md">test</div>
      </section>
    </main>
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
