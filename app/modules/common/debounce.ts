export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  period: number,
) {
  let timer: NodeJS.Timeout
  function callDebounced(...args: Args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), period)
  }
  callDebounced.cancel = () => clearTimeout(timer)
  return callDebounced
}
