import type { Key, UnionToTuple, Valueof } from './common.ts'

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
