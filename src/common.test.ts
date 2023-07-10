/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable id-length */
/* eslint-disable unicorn/consistent-function-scoping */
import {
  ConstArray,
  ConstObject,
  type IsFalsy,
  type IsNever,
  type MapFunc,
  type Result,
  type UnionToTuple,
  type Valueof,
  isJson,
  isJsonPrimitive,
  isNotNullish,
  sleep,
  wait,
} from './common'

describe('Result', () => {
  test('Success', () => {
    const s = [true, undefined] as const
    expectTypeOf(s).toMatchTypeOf<Result<true>>()
  })

  test('Failure', () => {
    const f = [undefined, new Error('fail')] as const
    expectTypeOf(f).toMatchTypeOf<Result<false>>()
  })
})

describe('Falsy', () => {
  test('normal', () => {
    expectTypeOf<IsFalsy<0>>().toEqualTypeOf<true>()
    expectTypeOf<IsFalsy<1>>().toEqualTypeOf<false>()
  })
})

describe('sleep', () => {
  test('', async () => {
    let num = 42
    const p = sleep(200).then(() => num++)
    const ct = Date.now()

    expect(num).toBe(42)
    await p
    expect(num).toBe(43)

    expect(Date.now() - ct).toBeLessThan(210)
    expect(Date.now() - ct).toBeGreaterThan(190)
  })
})

describe('wait', () => {
  const intervalMs = 30
  const timeoutMs = 200
  function waitTest(
    intervalCallback: () => unknown = async (): Promise<true> => sleep(0)
  ): [{ value: boolean }, Promise<Result<0 | 1>>, () => void] {
    const isResolved = { value: false }
    let num: 0 | 1 = 0
    return [
      isResolved,
      wait(
        async () => {
          await intervalCallback()
          return num
        },
        intervalMs,
        timeoutMs
      ).then((r: Result<0 | 1>) => {
        isResolved.value = true
        return r
      }),
      (): void => {
        num = 1
      },
    ]
  }
  test('normal', async () => {
    const [isResolved, waitPromise, doResolve] = waitTest()

    await sleep(intervalMs * 2)
    expect(isResolved.value).toBe(false)
    doResolve()
    const result = await waitPromise
    expect(isResolved.value).toBe(true)
    expect(result).toStrictEqual([1, undefined])
  })
  test('interval', async () => {
    let intervaledNumber = 0
    const [, waitPromise, doResolve] = waitTest(() => intervaledNumber++)

    const intervalNumber = 2

    await sleep(intervalMs * (intervalNumber + 0.1))
    expect(intervaledNumber).toBe(intervalNumber + 1)
    doResolve()
    await waitPromise
    await sleep(intervalMs * (intervalNumber + 0.1))
    expect(intervaledNumber).toBe(intervalNumber + 2)
  })
  test('timeout', async () => {
    const [, waitPromise] = waitTest()
    const result = await waitPromise
    expect(result[0]).toBe(undefined)
    expect(result[1]).toBeInstanceOf(Error)
  })
})

describe('Valueof', () => {
  test('normal', () => {
    const o = { a: 41, b: 42, c: 43 }
    expectTypeOf<Valueof<typeof o>>().toEqualTypeOf<number>()
  })

  test('const', () => {
    const o = { a: 41, b: 42, c: 43 } as const
    expectTypeOf<Valueof<typeof o>>().toEqualTypeOf<41 | 42 | 43>()
  })
})

describe('isNotNullish', () => {
  test('normal', () => {
    const o = [42, '', []] as unknown[]
    const inn = o.every((v) => isNotNullish(v))
    expect(inn).toBe(true)
  })
  test('null', () => {
    const o = [null, undefined] as unknown[]
    const inn = o.some((v) => isNotNullish(v))
    expect(inn).toBe(false)
  })
  test('type', () => {
    const o = 42 as unknown
    const inn = isNotNullish(o)
    if (inn) {
      expectTypeOf(o).toEqualTypeOf<Record<string, unknown>>()
    } else {
      expectTypeOf(o).toEqualTypeOf<unknown>()
    }
  })
})

describe('isJsonPrimitive', () => {
  test('normal', () => {
    const is = [42, null, 'abc', false] as unknown[]
    expect(is.every((i) => isJsonPrimitive(i))).toBe(true)
  })
  test('not Promitive', () => {
    const is = [{}, [], undefined] as unknown[]
    expect(is.some((i) => isJsonPrimitive(i))).toBe(false)
  })
})

describe('isJson', () => {
  test('normal', () => {
    const is = [42, null, 'abc', false, {}, []] as unknown[]
    expect(is.every((i) => isJson(i))).toBe(true)
  })
  test('not Json', () => {
    const is = [undefined, globalThis] as unknown[]
    expect(is.some((i) => isJson(i))).toBe(false)
  })
})

describe('IsNever', () => {
  test('normal', () => {
    expectTypeOf<IsNever<never>>().toEqualTypeOf<true>()
    expectTypeOf<IsNever<4>>().toEqualTypeOf<false>()
  })
})

describe('UnionToTuple', () => {
  test('normal', () => {
    expectTypeOf<UnionToTuple<1 | 2 | 3>>().toMatchTypeOf<
      [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
    >()
  })
})

describe('ConstObject.keys', () => {
  test('normal', () => {
    const keys = ConstObject.keys({ a: 41, b: 42 })
    expectTypeOf(keys).toMatchTypeOf<['a', 'b'] | ['b', 'a']>()
    expect(keys).toEqual(expect.arrayContaining(['a', 'b']))
    expect(keys).toHaveLength(2)
  })
})

describe('ConstObject.values', () => {
  test('normal', () => {
    const values = ConstObject.values({ a: 41, b: 42 })
    expectTypeOf(values).toMatchTypeOf<[41, 42] | [42, 41]>()
    expect(values).toEqual(expect.arrayContaining([41, 42]))
    expect(values).toHaveLength(2)
  })
})

describe('ConstObject.entries', () => {
  test('normal', () => {
    const entries = ConstObject.entries({ a: 41, b: 42 })
    expectTypeOf(entries).toMatchTypeOf<
      [['a', 41], ['b', 42]] | [['b', 42], ['a', 41]]
    >()
    expect(entries).toEqual(
      expect.arrayContaining([
        ['a', 41],
        ['b', 42],
      ])
    )
    expect(entries).toHaveLength(2)
  })
})

describe('ConstObject.fromEntries', () => {
  test('normal', () => {
    const object = ConstObject.fromEntries([
      ['b', 42],
      ['a', 41],
    ])
    expectTypeOf(object).toMatchTypeOf<{ a: 41; b: 42 }>()
    expect(object).toEqual({ a: 41, b: 42 })
  })
})

describe('ConstObject.map', () => {
  test('normal', () => {
    interface F extends MapFunc {
      value?: number
      ret?: `${this['value']}!`
    }
    const f: F = <N extends number>(num: N): `${N}!` => `${num}!`

    const object = ConstObject.map({ a: 41, b: 42 }, f)
    expectTypeOf(object).toMatchTypeOf<{ a: '41!'; b: '42!' }>()
    expect(object).toEqual({ a: '41!', b: '42!' })
  })
})

describe('ConstArray.map', () => {
  test('normal', () => {
    interface F extends MapFunc {
      value?: number
      ret?: `${this['value']}!`
    }
    const f: F = <N extends number>(num: N): `${N}!` => `${num}!`

    const array = ConstArray.map([41, 42], f)
    expectTypeOf(array).toMatchTypeOf<readonly ['41!', '42!']>()
    expect(array).toEqual(['41!', '42!'])
  })
})
