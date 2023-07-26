import { sleep, wait } from './promise.ts'
import type { Result } from './result.ts'

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
