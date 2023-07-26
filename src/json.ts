import type { Result } from './result.ts'
import { isNotNullish } from './common.ts'

export type JsonKey = number | string
export type JsonPrimitive = boolean | number | string | null

export function isJsonPrimitive(val: unknown): val is JsonPrimitive {
  return val === null || ['string', 'number', 'boolean'].includes(typeof val)
}
export type JsonObject = { [x in JsonKey]: Json }

export type JsonNonPrimitive = Json[] | JsonObject

export type Json = JsonNonPrimitive | JsonPrimitive
function _isJson(
  val: unknown,
  // 再帰的に探索しつつ、登場したオブジェクトを Set に登録していくため readonly にはできない
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  passeds: Set<unknown> = new Set<unknown>()
): val is Json {
  if (isJsonPrimitive(val)) {
    return true
  }
  if (!isNotNullish(val)) {
    return false
  }
  if (passeds.has(val)) {
    return false
  }
  passeds.add(val)
  return Object.values(val).every((item) => _isJson(item, passeds))
}
export function isJson(val: unknown): val is Json {
  return _isJson(val, new Set())
}

function _doExtends<T, M>(
  target: T,
  model: M,
  {
    keys,
  }: Readonly<{
    keys: readonly string[]
  }>
): Result<M & T> {
  function getResult(isSucceeded: true): [M & T, undefined]
  function getResult(
    isSucceeded: false,
    error: Readonly<Error> | null
  ): [undefined, Readonly<Error>]
  function getResult(
    isSucceeded: boolean,
    error?: Readonly<Error> | null
  ): Result<M & T> {
    if (isSucceeded) {
      return [target as M & T, undefined]
    }
    const joinedKeys = keys.map((key) => `['${key}']`).join('')
    return [
      undefined,
      error ??
        new Error(`target と model が一致しませんでした。keys: ${joinedKeys}`),
    ]
  }

  if (typeof target !== typeof model) {
    return getResult(false, null)
  }

  // @ts-expect-error target と model が同一の場合は無条件で extends とみなす
  if (target === model) {
    return [target, undefined]
  }

  if (isJsonPrimitive(target)) {
    if (!isJsonPrimitive(model)) {
      return getResult(false, null)
    }
    if (typeof target === typeof model) {
      return getResult(true)
    }
  }

  if (Array.isArray(target)) {
    if (!Array.isArray(model)) {
      return getResult(false, null)
    }
    const targetArray: unknown[] = target

    const [modelItem]: unknown[] = model
    for (const [i, targetItem] of Object.entries(targetArray)) {
      const [, error] = _doExtends(targetItem, modelItem, {
        keys: [...keys, i],
      })
      if (error) {
        return getResult(false, error)
      }
    }
    return getResult(true)
  }

  if (isNotNullish(target)) {
    if (!isNotNullish(model)) {
      return getResult(false, null)
    }

    for (const key of Object.keys(model)) {
      const [, error] = _doExtends(target[key], model[key], {
        keys: [...keys, key],
      })
      if (error) {
        return getResult(false, error)
      }
    }
    return getResult(true)
  }

  return getResult(false, null)
}

export function doExtends<T, M>(target: T, model: M): Result<M & T> {
  return _doExtends(target, model, { keys: [] })
}
