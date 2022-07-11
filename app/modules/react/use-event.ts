import { useCallback, useLayoutEffect, useRef } from "react"

export function useEvent<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
) {
  const ref = useRef((...args: Args): Result => {
    throw new Error("Attempt to call event callback during render")
  })

  useLayoutEffect(() => {
    ref.current = callback
  })

  return useCallback((...args: Args) => ref.current(...args), [])
}
