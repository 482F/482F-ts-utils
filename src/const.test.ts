import { ConstArray, ConstObject, type MapFunc, deepMerge } from './const.ts'

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

describe('deepMerge', () => {
  test('normal', () => {
    const a = {
      a: 42,
      b: {
        c: 43,
        d: 44,
        f: [45],
        g: { h: 46 },
      },
    } as const
    const b = {
      a: 47,
      b: {
        c: 48,
        e: 49,
        f: [50, 51],
      },
    } as const
    const [merged, err] = deepMerge(a, b)
    expect(err).toBeUndefined()
    if (err) {
      throw new Error('err')
    }
    expectTypeOf(merged).toMatchTypeOf<{
      a: 47
      b: {
        c: 48
        d: 44
        e: 49
        f: readonly [50, 51]
        g: { h: 46 }
      }
    }>()
    expect(merged).toEqual({
      a: 47,
      b: {
        c: 48,
        d: 44,
        e: 49,
        f: [50, 51],
        g: { h: 46 },
      },
    })
  })
  test('type mismatched', () => {
    const a = {
      a: 42,
      b: {
        c: 43,
        d: 44,
      },
    } as const
    const b = {
      a: 45,
      b: {
        c: 46,
        d: {
          f: 47,
        },
      },
    } as const
    const [merged, err] = deepMerge(a, b)
    expect(err).not.toBeUndefined()
    if (!err) {
      throw new Error('err')
    }
    expectTypeOf(merged).toMatchTypeOf<undefined>()
    expect(merged).toEqual(undefined)
  })
})
