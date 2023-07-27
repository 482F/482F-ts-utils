import type { Key, UnionToTuple, Valueof } from './common.ts'
import type { Result } from './result.ts'

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

type DeepMerge<A, B> = [
  A extends Record<string, unknown> ? true : false,
  B extends Record<string, unknown> ? true : false
] extends [infer IsARecord, infer IsBRecord]
  ? [IsARecord, IsBRecord] extends [false, true] | [true, false]
    ? never
    : [IsARecord, IsBRecord] extends [false, false]
    ? B extends undefined
      ? A
      : B
    : {
        [key in keyof A | keyof B]: [
          key extends keyof A ? A[key] : undefined,
          key extends keyof B ? B[key] : undefined
        ] extends [infer AVal, infer BVal]
          ? DeepMerge<AVal, BVal>
          : never
      }
  : never

function isObject(
  val: unknown
): val is (Record<string, unknown> & object) | undefined {
  // eslint-disable-next-line no-eq-null, eqeqeq
  return val != null && !Array.isArray(val) && typeof val === 'object'
}
export function _deepMerge<const A, const B>(
  a: A,
  b: B,
  keys: readonly string[]
): Result<unknown> {
  const getJoinedKeys = (): string =>
    keys.map((innerKey) => `["${innerKey}"]`).join('')
  const isAObject = isObject(a)
  const isBObject = isObject(b)
  if (a === undefined || b === undefined) {
    return [b ?? a, undefined]
  }
  if (!isAObject || !isBObject) {
    if (isAObject || isBObject) {
      return [
        undefined,
        new Error(
          `片方にはオブジェクト、片方には値が入っています。keys: ${getJoinedKeys()}`
        ),
      ]
    }
    return [b, undefined]
  }
  const record: Record<string, unknown> = {}
  for (const key of ConstObject.keys({
    ...a,
    ...b,
  })) {
    const aVal: unknown = a[key]
    const bVal: unknown = b[key]
    const [result, err] = _deepMerge(aVal, bVal, [...keys, key])
    if (err) {
      return [undefined, err]
    }
    record[key] = result
  }
  return [record, undefined]
}

export function deepMerge<const A, const B>(
  a: A,
  b: B
): Result<DeepMerge<A, B>> {
  return _deepMerge(a, b, []) as Result<DeepMerge<A, B>>
}
