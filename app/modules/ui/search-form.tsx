import { SearchIcon } from "@heroicons/react/solid"
import { Form } from "@remix-run/react"
import { useEffect, useMemo, useRef } from "react"
import { debounce } from "~/modules/common/debounce"
import { useLatestRef } from "../react/use-latest-ref"

export function SearchForm({
  name,
  defaultValue,
  onSubmit,
}: {
  name: string
  defaultValue: string
  onSubmit: (value: string) => void
}) {
  const onSubmitDebounced = useDebouncedCallback(onSubmit, 500)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(inputRef.current!.value)
        onSubmitDebounced.cancel()
      }}
    >
      <input
        className="w-full pr-10 input input-bordered"
        name={name}
        placeholder="Search..."
        defaultValue={defaultValue}
        onChange={(event) => onSubmitDebounced(event.target.value)}
        ref={inputRef}
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 p-3 btn btn-ghost"
        title="Submit"
      >
        <SearchIcon className="w-5" />
      </button>
    </Form>
  )
}

function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useLatestRef(callback)

  const debounced = useMemo(
    () => debounce((...args: Args) => callbackRef.current?.(...args), delay),
    [callbackRef, delay],
  )

  useEffect(() => () => debounced.cancel(), [debounced])

  return debounced
}
