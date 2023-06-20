import { Valueof } from './common'

type ColumnTsTypeMap = {
  TEXT: string
  INTEGER: number
  DATETIME: Date
}
type ColumnTsType<CT extends ColumnType> = ColumnTsTypeMap[CT]
type ColumnType = keyof ColumnTsTypeMap
type Column = {
  name: string
  type: ColumnType
  unique?: boolean
  notNull?: boolean
  primaryKey?: boolean
}
type NonPrimaryColumn = Column & { primaryKey?: false }
type PrimaryColumn = Column & { primaryKey: true }
type Columns = readonly [PrimaryColumn, ...NonPrimaryColumn[]]

type SELECTOR = (query: string, ...args: any[]) => any[]
type EXECUTOR = (query: string, ...args: any[]) => void

type ArrayOperator = 'in' | 'not in'
type NullOperator = 'is' | 'is not'
type NumberOperator = '<' | '<=' | '>' | '>='
type CommonOperator = '=' | '!='
type Operator = ArrayOperator | NullOperator | NumberOperator | CommonOperator
class Table<
  const CS extends Columns,
  const CM extends {
    readonly [i in keyof CS & `${number}` as CS[i]['name']]: CS[i]
  } = {
    readonly [i in keyof CS & `${number}` as CS[i]['name']]: CS[i]
  },
  const CTM extends {} = {
    readonly [k in keyof CM]: ColumnTsType<
      CM[k] extends Column ? CM[k]['type'] : never
    >
  },
  const WHERE extends {
    columnName: string
    connection: 'AND' | 'OR'
    operator: Operator
    value: any
  } = Valueof<{
    [k in keyof CM & keyof CTM as CM[k] extends Column ? k : never]: {
      columnName: k & string
      connection: 'AND' | 'OR'
    } & (
      | (CM[k] extends Column & { notNull: true }
          ? never
          : {
              operator: NullOperator
              value: null
            })
      | {
          operator:
            | CommonOperator
            | (CTM[k] extends number ? NumberOperator : never)
          value: CTM[k]
        }
      | {
          operator: ArrayOperator
          value: CTM[k][]
        }
    )
  }>,
  const WHERENC extends Omit<WHERE, 'connection'> = Omit<WHERE, 'connection'>,
  const NULLABLECNS = keyof {
    [name in keyof CM as CM[name] extends { notNull: true }
      ? never
      : name]: true
  }
> {
  name: string
  private columnMap: CM
  private selector: SELECTOR
  private executor: EXECUTOR
  constructor(
    name: string,
    columns: CS,
    selector: SELECTOR,
    executor: EXECUTOR
  ) {
    this.name = name
    this.columnMap = Object.fromEntries(
      columns.map((column) => [column.name, column])
    ) as CM
    this.selector = selector
    this.executor = executor
  }
  async init() {
    const columns: Column[] = Object.values(this.columnMap)
    await this.executor(
      `CREATE TABLE IF NOT EXISTS ${this.name} (` +
        columns
          .map(
            (column) =>
              `${column.name} ${column.type} ${column.unique ? 'UNIQUE' : ''} ${
                column.notNull ? 'NOT NULL' : ''
              } ${column.primaryKey ? 'PRIMARY KEY' : ''}`
          )
          .join(',') +
        `)`
    )
    // `CREATE TABLE IF NOT EXISTS hosts (
    //   id           INTEGER  UNIQUE NOT NULL PRIMARY KEY  ,
    //   url          TEXT     UNIQUE NOT NULL              ,
    //   name         TEXT            NOT NULL              ,
    //   pass         TEXT            NOT NULL
    // );`,
  }
  async select<const CNS extends readonly (keyof CM)[]>({
    columnNames,
    where,
  }: {
    columnNames: CNS
    where: [WHERENC, ...WHERE[]]
  }) {
    // notNull を考慮しない返り値の型
    type RT = {
      [x in CNS[number]]: ColumnTsType<
        CM[x] extends Column ? CM[x]['type'] : never
      >
    }
    // notNull を考慮した返り値の型
    type TRT = { [k in keyof RT]?: RT[k] } & {
      [k in keyof RT as k extends NULLABLECNS ? never : k]: RT[k]
    }

    const query =
      `SELECT ` +
      columnNames.join(',') +
      ` WHERE ` +
      where.map((w) => {
        return `${'connection' in w ? w.connection : ''} ${w.columnName} ${
          w.operator
        } ?`
      }) +
      ';'

    // TRT がオブジェクトのユニオン型になってプレビューが見づらいのでマージした型にする (型自体に変更は無い)
    const result: { [k in keyof TRT]: TRT[k] }[] = await this.selector(
      query,
      ...where.map((w) => w.value)
    )
    return result
  }
}

class Database<
  const TS extends readonly { name: string & keyof TM; columns: Columns }[],
  const TM extends {
    readonly [i in keyof TS & `${number}` as TS[i]['name']]: Table<
      TS[i]['columns']
    >
  }
> {
  name: string
  tableMap: TM
  constructor(
    name: string,
    tables: TS,
    selector: SELECTOR,
    executor: EXECUTOR
  ) {
    this.name = name
    this.tableMap = Object.fromEntries(
      tables.map((table) => [
        table.name,
        new Table(table.name, table.columns, selector, executor),
      ])
    ) as TM
  }
}

const columns = [
  { name: 'id', type: 'TEXT', unique: true, notNull: true, primaryKey: true },
  { name: 'body', type: 'TEXT' },
  { name: 'userId', type: 'INTEGER', notNull: true },
  { name: 'time', type: 'DATETIME', notNull: true },
] as const

const rand = String(Math.random())
const ns = {
  name: `${rand}-main-table`,
  name2: `${rand}-main-table2`,
} as const

const tables = [
    {
      name: ns.name,
      columns,
    },
    {
      name: ns.name2,
      columns: [
        { name: 'abc', type: 'INTEGER', primaryKey: true, notNull: true },
      ],
    },
  ] as const

const db = new Database(
  'main',
  tables,
  () => [],
  () => {}
)
const t = db.tableMap[ns.name]

const result = await t?.select({
  columnNames: ['id', 'body', 'userId', 'time'],
  where: [
    { columnName: 'id', operator: '=', value: 'abcdef' },
    { connection: 'OR', columnName: 'body', operator: 'is', value: null },
    { connection: 'OR', columnName: 'userId', operator: 'in', value: [1, 2] },
    { connection: 'OR', columnName: 'time', operator: '=', value: new Date() },
  ],
})
if (!result) throw new Error()

result[0]?.body
// id           TEXT     UNIQUE NOT NULL PRIMARY KEY  ,
// body         TEXT                                  ,
// user_id      INTEGER         NOT NULL              ,
// time         DATETIME        NOT NULL              ,

export {}
