import { useSyncExternalStore } from "react"

export class Cell<T> {
  private value: T
  private readonly subscribers = new Set<(value: T) => void>()

  constructor(value: T) {
    this.value = value
  }

  get current() {
    return this.value
  }

  set = (value: T) => {
    this.value = value
    for (const subscriber of this.subscribers) subscriber(value)
  }

  subscribe = (callback: (value: T) => void) => {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }
}

export function useCell<T>(cell: Cell<T>) {
  return useSyncExternalStore(
    cell.subscribe,
    () => cell.current,
    () => cell.current,
  )
}
