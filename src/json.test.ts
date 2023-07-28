import { doExtends, isJson, isJsonPrimitive } from './json.ts'
import type { Result } from './result.ts'

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

describe('doExtends', () => {
  const model = {
    a: 0,
    arr: [{ b: '', c: '' }],
    obj: { d: null },
  }
  test('normal', () => {
    const target = {
      a: 42,
      arr: [
        { b: 'abc', c: 'def' },
        { b: 'ghi', c: 'jkl' },
      ],
      obj: { d: null },

      extra: new Date(),
    }
    const [r] = doExtends(target, model)
    expect(r).toBeTruthy()
  })

  test('not extended', () => {
    const targets = [
      {
        a: '',
        arr: [
          { b: 'abc', c: 'def' },
          { b: 'ghi', c: 'jkl' },
        ],
        obj: { d: null },
      },
      {
        a: 42,
        arr: [
          { b: 'abc', c: 'def' },
          { b: 'ghi', c: 1 },
        ],
        obj: { d: null },
      },
      {
        a: 42,
        arr: [
          { b: 'abc', c: 'def' },
          { b: 'ghi', c: 'jkl' },
        ],
        obj: { d: {} },
      },
    ] as const
    expect(
      targets
        .map((target) => doExtends(target, model))
        .every(([, error]: Result<unknown>) => error)
    ).toBeTruthy()
  })
})
