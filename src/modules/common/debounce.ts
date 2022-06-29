export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  period: number,
) {
  let timer: NodeJS.Timeout
  return (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), period)
  }
}
