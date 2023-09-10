import { matchGroups, matchGroupsAll } from './regex.ts'

const target = '123-456-789'
describe('matchGroups', () => {
  test('normal', () => {
    const [groups] = matchGroups(
      target,
      /(?<first>\d+)-(?<second>\d+)-(?<chars>[a-z])?/u,
      ['first', 'second', 'chars?']
    )
    expectTypeOf<typeof groups>().toEqualTypeOf<
      | {
          readonly first: string
          readonly second: string
          readonly chars: string | undefined
        }
      | undefined
    >()

    expect(groups).not.toBe(undefined)
    if (groups === undefined) {
      throw new Error('err')
    }
    expect(groups.first).toBeTypeOf('string')
    expect(groups.second).toBeTypeOf('string')
    expect(['undefined', 'string']).toContain(typeof groups.chars)
  })

  test('fail', () => {
    const [groups1] = matchGroups(target, /(?<none>[a-z])/u, ['none'])

    expect(groups1).toBe(undefined)

    const [groups2] = matchGroups(target, /(?<num>\d+)/u, ['number'])
    expect(groups2).toBe(undefined)
  })
})

describe('matchGroupsAll', () => {
  test('normal', () => {
    const [groups] = matchGroupsAll(target, /-(?<nums>\d+)(?<char>[a-z])?/gu, [
      'nums',
      'char?',
    ])
    expectTypeOf<typeof groups>().toEqualTypeOf<
      | {
          readonly nums: string
          readonly char: string | undefined
        }[]
      | undefined
    >()

    expect(groups).not.toBe(undefined)
    if (groups === undefined) {
      throw new Error('err')
    }
    expect(groups[0]?.nums).toBeTypeOf('string')
    expect(['undefined', 'string']).toContain(typeof groups[0]?.char)
  })

  test('fail', () => {
    const [groups1] = matchGroupsAll(target, /(?<none>[a-z])/gu, ['none'])

    expect(groups1).toStrictEqual([])

    const [groups2] = matchGroupsAll(target, /(?<num>\d+)/gu, ['number'])
    expect(groups2).toBe(undefined)
  })
})
