import { compactParams } from "~/modules/dom/compact-params"

export function makeSearchContext(searchParams: URLSearchParams) {
  const paramName = "search"
  const searchQuery = searchParams.get(paramName) ?? ""

  const getSearchLink = (query: string) =>
    "?" + compactParams({ ...searchParams, [paramName]: query })

  return { paramName, searchQuery, getSearchLink }
}
