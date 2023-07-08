export type Result<V> =
  | readonly [undefined, Readonly<Error>]
  | readonly [V, undefined]

type Falsy = '' | 0 | 0n | false | null | undefined

export type IsFalsy<T> = T extends Falsy ? true : false

export async function sleep(ms = 100): Promise<true> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true)
    }, ms)
  )
}

export async function wait<
  F extends () => unknown,
  RR extends F extends () => infer U ? U : never,
  R extends NonNullable<Awaited<RR>>
>(func: F, intervalMs = 100, timeoutMs = 10_000): Promise<Result<R>> {
  let timeouted = false
  if (timeoutMs) {
    setTimeout(() => {
      timeouted = true
    }, timeoutMs)
  }

  let result: R | null = null
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-unmodified-loop-condition
  while (!result && !timeouted) {
    // 直列で実行して結果が truthy になるまで待つ必要があるためループ内での await を許可
    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line @typescript-eslint/await-thenable
    result = (await func()) as R
    await sleep(intervalMs)
    /* eslint-enable no-await-in-loop */
  }

  if (!result) {
    return [undefined, new Error('wait 関数がタイムアウトしました')]
  }

  return [result, undefined]
}

export type Key = number | string | symbol

export type Valueof<
  O extends { [k in K]: O[k] },
  K extends keyof O = keyof O
  // eslint-disable-next-line @typescript-eslint/no-type-alias
> = O[K]

export function isNotNullish(val: unknown): val is Record<string, unknown> {
  // undefined もしくは null でない場合なので `!=` を使用
  // eslint-disable-next-line no-eq-null, eqeqeq
  return val != null
}

export type JsonKey = number | string
export type JsonPrimitive = boolean | number | string | null

export function isJsonPrimitive(val: unknown): val is JsonPrimitive {
  return val === null || ['string', 'number', 'boolean'].includes(typeof val)
}
export type JsonObject = { [x in JsonKey]: Json }

export type JsonNonPrimitive = Json[] | JsonObject

export type Json = JsonNonPrimitive | JsonPrimitive
function _isJson(
  val: unknown,
  // 再帰的に探索しつつ、登場したオブジェクトを Set に登録していくため readonly にはできない
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  passeds: Set<unknown> = new Set<unknown>()
): val is Json {
  if (isJsonPrimitive(val)) {
    return true
  }
  if (!isNotNullish(val)) {
    return false
  }
  if (passeds.has(val)) {
    return false
  }
  passeds.add(val)
  return Object.values(val).every((item) => _isJson(item, passeds))
}
export function isJson(val: unknown): val is Json {
  return _isJson(val, new Set())
}

export type IsNever<T> = [T] extends [never] ? true : false

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

interface _MapFunc {
  (
    value: Readonly<NonNullable<this['value']>>,
    key: Readonly<NonNullable<this['key']>>
  ): this['retNullable'] extends false | undefined
    ? NonNullable<this['ret']>
    : this['ret']
  value?: unknown
  key?: Key
  ret?: unknown
  retNullable?: boolean
}

type Apply<F, V, K> = F extends { ret?: unknown; retNullable?: boolean }
  ? (F & { value: V; key: K })['ret'] extends infer U
    ? F['retNullable'] extends false | undefined
      ? NonNullable<U>
      : U
    : never
  : never
export interface MapFunc extends _MapFunc {
  retNullable?: false
}
export interface NullableMapFunc extends _MapFunc {
  retNullable?: true
}

export const ConstObject = {
  keys<
    const ConstObject extends { readonly [k in Key]: ConstObject[k] },
    KeyUnion extends keyof ConstObject,
    KeyTuple extends UnionToTuple<KeyUnion>
  >(constObject: Record<KeyUnion, unknown>): KeyTuple {
    return Object.keys(constObject) as KeyTuple
  },
  values<
    const ConstObject extends { readonly [k in Key]: ConstObject[k] },
    ValueUnion extends Valueof<ConstObject>,
    ValueTuple extends UnionToTuple<ValueUnion>
  >(constObject: ConstObject): ValueTuple {
    return Object.values(constObject) as ValueTuple
  },

  entries<
    const ConstObject extends { readonly [k in Key]: ConstObject[k] },
    KeyUnion extends keyof ConstObject,
    KeyTuple extends UnionToTuple<KeyUnion>,
    EntryTuple extends [unknown, unknown][] & {
      [i in keyof KeyTuple]: KeyTuple[i] extends infer key
        ? key extends keyof ConstObject
          ? [key, ConstObject[key]]
          : [never, never]
        : [never, never]
    }
  >(constObject: ConstObject): EntryTuple {
    return Object.entries(constObject) as unknown as EntryTuple
  },
  fromEntries<
    const ConstEntries extends readonly (readonly [Key, unknown])[],
    EntryUnion extends ConstEntries[number],
    ConstObject extends {
      [I in EntryUnion & number as I[0]]: I[1]
    }
  >(constEntries: ConstEntries): ConstObject {
    return Object.fromEntries(constEntries) as ConstObject
  },
  map<
    const ConstObject extends {
      [k in Key]: ConstObject[k]
    },
    F extends MapFunc,
    const MappedConstObject extends {
      [k in keyof ConstObject]: Apply<F, ConstObject[k], k>
    }
  >(constObject: ConstObject, mapFunc: F): MappedConstObject {
    const constEntries = ConstObject.entries(constObject)
    const mappedConstEntries = constEntries.map(
      ([key, value]: readonly [unknown, unknown]) => [
        key,
        mapFunc(
          value as Readonly<NonNullable<F['value']>>,
          key as Readonly<NonNullable<F['key']>>
        ),
      ]
    ) as [keyof ConstObject, F['ret']][]
    const mappedConstObject = ConstObject.fromEntries(mappedConstEntries)
    return mappedConstObject as MappedConstObject
  },
}

export const ConstArray = {
  map<
    const ConstArray extends readonly unknown[],
    F extends MapFunc,
    const MappedConstArray extends {
      [i in keyof ConstArray]: Apply<F, ConstArray[i], i>
    }
  >(constArray: ConstArray, mapFunc: F): MappedConstArray {
    const mappedConstArray = (
      constArray as unknown as Readonly<NonNullable<F['value']>>[]
    ).map((el, i) => mapFunc(el, i as Readonly<NonNullable<F['key']>>))
    return mappedConstArray as unknown as MappedConstArray
  },
}

/*
 * ConstObject: filter
 * ConstArray: flatMap, filter
 * interceptCommunications
 * formatDate
 * measureTime
 * svgToPng
 * randBetween, randPick, shuffle
 * sha256
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
