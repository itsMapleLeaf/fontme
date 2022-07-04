import { useCallback, useRef, useState } from "react"

export function useTimer(duration: number) {
  const [running, setRunning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const start = useCallback(() => {
    setRunning(true)
    timeoutRef.current = setTimeout(() => {
      setRunning(false)
    }, duration)
  }, [duration])

  return { start, running }
}
