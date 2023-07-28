import type { Result } from './result.ts'

export async function sleep(ms = 100): Promise<true> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true)
    }, ms)
  )
}

export async function wait<
  F extends () => unknown,
  RR extends F extends () => infer U ? U : never,
  R extends NonNullable<Awaited<RR>>
>(func: F, intervalMs = 100, timeoutMs = 10_000): Promise<Result<R>> {
  let timeouted = false
  if (timeoutMs) {
    setTimeout(() => {
      timeouted = true
    }, timeoutMs)
  }

  let result: R | null = null
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-unmodified-loop-condition
  while (!result && !timeouted) {
    // 直列で実行して結果が truthy になるまで待つ必要があるためループ内での await を許可
    /* eslint-disable no-await-in-loop */
    // eslint-disable-next-line @typescript-eslint/await-thenable
    result = (await func()) as R
    await sleep(intervalMs)
    /* eslint-enable no-await-in-loop */
  }

  if (!result) {
    return [undefined, new Error('wait 関数がタイムアウトしました')]
  }

  return [result, undefined]
}
