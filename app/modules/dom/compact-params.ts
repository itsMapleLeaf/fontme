type URLSearchParamsInit =
  | string
  | URLSearchParams
  | string[][]
  | Record<string, string>

/** Removes empty string param values */
export function compactParams(init: URLSearchParamsInit) {
  const params = new URLSearchParams(init)
  for (const [key, value] of params) {
    if (value === "") {
      params.delete(key)
    }
  }
  return params
}
