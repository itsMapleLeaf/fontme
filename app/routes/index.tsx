import { DataFunctionArgs, Deferrable, deferred } from "@remix-run/node"
import { Deferred, useLoaderData, useSearchParams } from "@remix-run/react"
import { FontSelector } from "~/modules/font-selection"
import { Font, loadFonts } from "~/modules/fonts/api.server"
import { FontList, FontListFallback } from "~/modules/fonts/font-list"
import { SearchForm } from "~/modules/ui/search-form"

const searchParamName = "search"

type LoaderData = {
  fonts: Deferrable<Font[]>
}

export async function loader({ request }: DataFunctionArgs) {
  return deferred<LoaderData>({ fonts: loadFonts() })
}

// don't ever reload this data; it's huge and rarely changes
export const unstable_shouldReload = () => false

export default function Index() {
  const { fonts } = useLoaderData<LoaderData>()

  const [params] = useSearchParams()
  const searchQuery = params.get(searchParamName) ?? ""

  return (
    <main className="fixed inset-0 flex">
      <section className="bg-base-100 overflow-y-auto shadow-md flex flex-col content-start w-72">
        <div className="p-4">
          <SearchForm paramName={searchParamName} />
        </div>
        <div className="flex-1">
          <Deferred value={fonts} fallback={<FontListFallback />}>
            {(fonts) => <FontList fonts={fonts} searchQuery={searchQuery} />}
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
