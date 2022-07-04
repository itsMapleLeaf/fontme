export async function logPromiseTime<T>(name: string, promise: Promise<T>) {
  const start = Date.now()
  const result = await promise
  console.info(`${name}: ${Date.now() - start}ms`)
  return result
}
