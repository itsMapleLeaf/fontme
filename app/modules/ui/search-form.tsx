import { SearchIcon } from "@heroicons/react/solid"
import { Form, useSearchParams } from "@remix-run/react"
import { useMemo } from "react"
import { debounce } from "~/modules/common/debounce"

export function SearchForm({ paramName }: { paramName: string }) {
  const [params, setParams] = useSearchParams()

  const setParamsDebounced = useMemo(
    () => debounce(setParams, 300),
    [setParams],
  )

  return (
    <Form className="relative">
      <input
        className="input input-bordered w-full pr-10"
        name={paramName}
        placeholder="Search..."
        defaultValue={params.get(paramName) ?? ""}
        onChange={(event) => {
          const newParams = new URLSearchParams(params)
          if (event.target.value) {
            newParams.set(paramName, event.target.value)
          } else {
            newParams.delete(paramName)
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
