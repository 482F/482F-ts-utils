import {
  type IsFalsy,
  type IsNever,
  type Result,
  ResultUtils,
  type UnionToTuple,
  type Valueof,
  isNotNullish,
} from './common.ts'

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

describe('ResultUtils', () => {
  test('Success', () => {
    const s = [true, undefined] as const
    expect(ResultUtils.unwrap(s)).toBe(true)
    expect(ResultUtils.expect(s, new Error('test'))).toBe(true)
  })
  test('Failure', () => {
    const f = [undefined, new Error('fail unwrap')] as const
    expect(() => {
      ResultUtils.unwrap(f)
    }).toThrowError()
    expect(() => {
      ResultUtils.expect(f, new Error('test'))
    }).toThrowError()
  })
})

describe('Falsy', () => {
  test('normal', () => {
    expectTypeOf<IsFalsy<0>>().toEqualTypeOf<true>()
    expectTypeOf<IsFalsy<1>>().toEqualTypeOf<false>()
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
