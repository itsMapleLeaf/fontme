export type Falsy = false | 0 | "" | null | undefined
type IsTruthyFn = <T>(value: T | Falsy) => value is T
export const isTruthy = Boolean as unknown as IsTruthyFn
