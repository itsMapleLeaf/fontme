import { DataFunctionArgs, Deferrable, deferred } from "@remix-run/node"
import { Deferred, useLoaderData, useSearchParams } from "@remix-run/react"
import { matchSorter } from "match-sorter"
import { FontSelector } from "~/modules/font-selection"
import { Font, loadFonts } from "~/modules/fonts/api.server"
import { FontList } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"

type LoaderData = {
  fonts: Deferrable<Font[]>
}

const searchParamName = "search"

export async function loader({ request }: DataFunctionArgs) {
  const params = new URL(request.url).searchParams
  const searchQuery = params.get(searchParamName)

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
      <section className="bg-base-100 overflow-y-auto shadow-md flex flex-col content-start w-72">
        <div className="p-4">
          <SearchForm paramName={searchParamName} />
        </div>
        <div className="flex-1">
          <Deferred value={fonts} fallback={<p>Loading...</p>}>
            {(fonts) => <FontList fonts={fonts} />}
          </Deferred>
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
