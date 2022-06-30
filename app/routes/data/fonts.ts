import { DataFunctionArgs } from "@remix-run/node"
import { jsonTyped, useFetcherTyped } from "remix-typed"
import { loadFonts } from "~/modules/fonts/api.server"

export async function loader({ request }: DataFunctionArgs) {
  return jsonTyped(await loadFonts())
}

export function useFontsFetcher() {
  const fetcher = useFetcherTyped<typeof loader>()
  return {
    ...fetcher,
    load: () => fetcher.load("/data/fonts"),
  }
}
