import { useSearchParams } from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { useEffect } from "react"
import { FontSelector } from "~/modules/font-selection"
import { FontList } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"
import { useFontsFetcher } from "~/routes/data/fonts"

const searchParamName = "search"

export default function Index() {
  const [params] = useSearchParams()
  const searchQuery = params.get(searchParamName) ?? ""

  const fetcher = useFontsFetcher()
  useEffect(() => {
    if (fetcher.type === "init") {
      fetcher.load()
    }
  })

  let fonts = fetcher.data ?? []
  if (searchQuery) {
    fonts = matchSorter(fonts, searchQuery, { keys: ["family"] })
  }

  return (
    <main className="fixed inset-0 flex">
      <section className="bg-base-100 overflow-y-auto shadow-md flex flex-col content-start w-72">
        <div className="p-4">
          <SearchForm paramName={searchParamName} />
        </div>
        <div className="flex-1">
          {fetcher.state === "idle" ? (
            <FontList fonts={fonts} />
          ) : (
            <p className="p-3 text-center opacity-50">Loading...</p>
          )}
        </div>
      </section>
      <section className="flex-1 min-w-0 p-4">
        <div className="bg-base-100 rounded-md p-4 shadow-md">
          <FontCss />
        </div>
      </section>
    </main>
  )
}

function FontCss() {
  const [params] = useSearchParams()
  return (
    <pre>
      {JSON.stringify(
        FontSelector.fromParamString(params.get("fonts") ?? ""),
        undefined,
        2,
      )}
    </pre>
  )
}
