import { isJson, isJsonPrimitive } from './json.ts'

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
