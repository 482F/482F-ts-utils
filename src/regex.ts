import type { Result } from './result'

function isValidGroups(
  names: readonly string[],
  groups: Readonly<Record<string, string | readonly string[] | undefined>>
) {
  return names.every((name) => {
    const last = name.at(-1) ?? ''
    const trueName = name.replace(/\?$/u, '')
    if (last === '?') {
      return (
        groups[trueName] === undefined || typeof groups[trueName] === 'string'
      )
    } else {
      return typeof groups[trueName] === 'string'
    }
  })
}

export function matchGroupsAll<
  const NS extends readonly string[],
  R = {
    [i in keyof NS as i extends `${number}`
      ? i
      : never]: NS[i] extends `${infer U}?`
      ? [U, string | undefined]
      : [NS[i], string]
  } extends infer RR extends Record<string, [string, string | undefined]>
    ? {
        [j in keyof RR as j extends `${number}` ? RR[j][0] : never]: RR[j][1]
      }[]
    : never
>(target: string, pattern: RegExp, names: NS): Result<R> {
  const allGroups = [...target.matchAll(pattern)].map((m) => m.groups ?? {})
  return allGroups.every((groups) => isValidGroups(names, groups))
    ? [allGroups as R, undefined]
    : [
        undefined,
        new Error(
          `検索結果が names に則っていません。groups: ${JSON.stringify(
            allGroups
          )}`
        ),
      ]
}

export function matchGroups<
  const NS extends readonly string[],
  R = Result<NonNullable<ReturnType<typeof matchGroupsAll<NS>>[0]>[number]>
>(target: string, pattern: RegExp, names: NS): R {
  const groups = target.match(pattern)?.groups ?? {}
  return (
    isValidGroups(names, groups)
      ? [groups, undefined]
      : [
          undefined,
          new Error(
            `検索結果が names に則っていません。groups: ${JSON.stringify(
              groups
            )}`
          ),
        ]
  ) as R
}
