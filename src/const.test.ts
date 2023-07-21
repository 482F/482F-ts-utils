import { ConstArray, ConstObject, type MapFunc } from './const'

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
