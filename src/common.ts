export type Result<V> =
  | readonly [undefined, Readonly<Error>]
  | readonly [V, undefined]

type Falsy = '' | 0 | 0n | false | null | undefined

export type IsFalsy<T> = T extends Falsy ? true : false

export type IsNever<T> = [T] extends [never] ? true : false

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

/*
 * const p = (num) => num.toString().padStart(2, '0')
 * const rules = [
 *   { target: 'yyyy', converter: (date) => date.getFullYear() },
 *   { target: 'MM', converter: (date) => p(date.getMonth() + 1) },
 *   { target: 'dd', converter: (date) => p(date.getDate()) },
 *   { target: 'HH', converter: (date) => p(date.getHours()) },
 *   { target: 'mm', converter: (date) => p(date.getMinutes()) },
 *   { target: 'ss', converter: (date) => p(date.getSeconds()) },
 *   { target: 'fff', converter: (date) => p(date.getMilliseconds()) },
 *   { target: 'a', converter: (date) => '日月火水木金土'[date.getDay()] },
 * ].map(({ target, converter }) => ({
 *   target,
 *   pattern: new RegExp(`(?<!\\$)\\$${target}`, 'g'),
 *   converter,
 * }))
 *
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
 * date.format = (date, format) => {
 *   const results = {}
 *
 *   return rules
 *     .reduce((prev, { target, pattern, converter }) => {
 *       return prev.map((section) => {
 *         if (!section.match(pattern)) {
 *           return section
 *         }
 *
 *         if (!results[target]) {
 *           results[target] = converter(date)
 *         }
 *
 *         return section.replaceAll(pattern, results[target])
 *       })
 *     }, format.split('$$'))
 *     .join('$')
 * }
 *
 * date._test.format = (tester) => {
 *   const targetDate = new Date(2022, 04, 26, 12, 26, 37)
 *   tester.assertEqual(
 *     '2022/05/26 12:26:37 (木)',
 *     date.format(targetDate, '$yyyy/$MM/$dd $HH:$mm:$ss ($a)')
 *   )
 *   tester.assertEqual('20222022', date.format(targetDate, '$yyyy$yyyy'))
 *   tester.assertEqual('$yyyy', date.format(targetDate, '$$yyyy'))
 *   tester.assertEqual('$2022', date.format(targetDate, '$$$yyyy'))
 *   tester.assertEqual('$$', date.format(targetDate, '$$$$'))
 * }
 *
 */
