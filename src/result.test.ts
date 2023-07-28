import { type Result, unwrap } from './result.ts'

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

describe('unwrap', () => {
  test('Success', () => {
    const s = [true, undefined] as const
    expect(unwrap(s)).toBe(true)
  })
  test('Failure', () => {
    const f = [undefined, new Error('fail unwrap')] as const
    expect(() => {
      unwrap(f)
    }).toThrowError()
  })
})
