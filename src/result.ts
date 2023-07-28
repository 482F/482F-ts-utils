export type Result<V> =
  | readonly [undefined, Readonly<Error>]
  | readonly [V, undefined]

export function unwrap<T>(r: Result<T>): T {
  const [v, e] = r
  if (e) {
    throw e
  }
  return v
}
