import { useCallback, useRef, useState } from "react"
import { useLatestRef } from "../react/use-latest-ref"

type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; value: T }
  | { status: "error"; error: unknown }

export function useAsync<T, Args extends unknown[]>(
  callback: (...args: Args) => PromiseLike<T> | T,
  options?: {
    onSuccess?: (value: T) => void
    onError?: (error: unknown) => void
  },
) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" })
  const callbackRef = useLatestRef(callback)
  const runIdRef = useRef<string>()

  const run = useCallback(
    async (...args: Args) => {
      const runId = (runIdRef.current = crypto.randomUUID())

      setState({ status: "loading" })

      const state = await Promise.resolve(callbackRef.current(...args))
        .then<AsyncState<T>>((value) => {
          options?.onSuccess?.(value)
          return { status: "success" as const, value }
        })
        .catch<AsyncState<T>>((error: unknown) => {
          options?.onError?.(error)
          return { status: "error" as const, error }
        })

      if (runId === runIdRef.current) {
        setState(state)
      }
    },
    [callbackRef],
  )

  return [state, run] as const
}
