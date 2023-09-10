type Falsy = '' | 0 | 0n | false | null | undefined

export type IsFalsy<T> = T extends Falsy ? true : false

export type IsNever<T> = [T] extends [never] ? true : false

export type IsTuple<T extends readonly unknown[]> = number extends T['length']
  ? false
  : true

export function isNotNullish(val: unknown): val is Record<string, unknown> {
  // undefined もしくは null でない場合なので `!=` を使用
  // eslint-disable-next-line no-eq-null, eqeqeq
  return val != null
}

export type Key = number | string | symbol

export type Valueof<
  O extends { [k in K]: O[k] },
  K extends keyof O = keyof O
  // eslint-disable-next-line @typescript-eslint/no-type-alias
> = O[K]

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never

type LastOf<U> = UnionToIntersection<
  U extends unknown ? () => U : never
> extends () => infer R
  ? R
  : never

type _UnionToTuple<U, L = LastOf<U>> = IsNever<U> extends true
  ? []
  : [..._UnionToTuple<Exclude<U, L>>, L]

export type UnionToTuple<U> = _UnionToTuple<U>

/**
 * @param {Date} date - 変換対象の Date
 * @param {String} format - 変換規則。下記の規則で変換される
 *  - $yyyy -> 西暦
 *  - $MM   -> 月
 *  - $dd   -> 日
 *  - $HH   -> 時
 *  - $mm   -> 分
 *  - $ss   -> 秒
 *  - $fff  -> ミリ秒
 *  - $a    -> 曜日 (ex. 月)
 *  - $$    -> $ (エスケープ)
 * @return {String} - date を format に従って変換した文字列
 */
export const formatDate = (() => {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const p = (num: number) => num.toString().padStart(2, '0')
  const rules = [
    {
      converter: (date: Readonly<Date>) => date.getFullYear().toString(),
      target: 'yyyy',
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      converter: (date: Readonly<Date>) => p(date.getMonth() + 1),
      target: 'MM',
    },
    { converter: (date: Readonly<Date>) => p(date.getDate()), target: 'dd' },
    { converter: (date: Readonly<Date>) => p(date.getHours()), target: 'HH' },
    { converter: (date: Readonly<Date>) => p(date.getMinutes()), target: 'mm' },
    { converter: (date: Readonly<Date>) => p(date.getSeconds()), target: 'ss' },
    {
      converter: (date: Readonly<Date>) => p(date.getMilliseconds()),
      target: 'fff',
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      converter: (date: Readonly<Date>) => '日月火水木金土'[date.getDay()]!,
      target: 'a',
    },
  ].map(
    ({
      target,
      converter,
    }: Readonly<{
      target: string
      converter: (date: Readonly<Date>) => string
    }>) => ({
      converter,
      pattern: new RegExp(`(?<!\\$)\\$${target}`, 'gu'),
      target,
    })
  )

  return (date: Readonly<Date>, format: string) => {
    const results: Record<string, string> = {}
    return rules
      .reduce(
        (
          prev: readonly string[],
          {
            target,
            pattern,
            converter,
          }: Readonly<{
            target: string
            pattern: Readonly<RegExp>
            converter: (date: Readonly<Date>) => string
          }>
        ) =>
          prev.map((section) => {
            if (!pattern.test(section)) {
              return section
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-multi-assign
            const result = (results[target] ??= converter(date))

            return section.replaceAll(pattern, result)
          }),
        format.split('$$')
      )
      .join('$')
  }
})()

/*
 * ConstObject: filter
 * ConstArray: flatMap, filter
 * interceptCommunications
 * formatDate
 * measureTime
 * svgToPng
 * randBetween, randPick, shuffle
 * sha256
 * isExtends
 *
 * browser
 * - textarea
 * - getCDN
 * - downloadText (cp932)
 * - clip
 */
