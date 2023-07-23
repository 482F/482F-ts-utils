import { isNotNullish } from './common'

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
