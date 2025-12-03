import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
const ALLOWED_TYPES = new Set(['text','integer','numeric','boolean','timestamp'])
const typeMap: Record<string,string> = {
  text: 'TEXT', integer: 'INTEGER', numeric: 'NUMERIC(12,2)', boolean: 'BOOLEAN', timestamp: 'TIMESTAMP',
}
@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}
listTables() {
    return this.prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `
  }
  getColumns(table: string) {
    return this.prisma.$queryRaw<{ column_name: string; data_type: string; is_nullable: 'YES'|'NO' }[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position
    `
  }
  getRows(table: string) {
    return this.prisma.$queryRawUnsafe(`SELECT * FROM "${table}" LIMIT 500`)
  }
  async insertRow(table: string, values: Record<string, any>) {
    console.log('=== INSERT ROW DEBUG ===')
    console.log('Table:', table)
    console.log('Values received:', values)
    
    // Get column information to properly type the values
    const columns = await this.getColumns(table)
    type ColumnInfo = { type: string; nullable: string }
    const columnInfo = new Map<string, ColumnInfo>(columns.map(c => [c.column_name, { type: c.data_type, nullable: c.is_nullable }]))
    
    console.log('Column info:', Array.from(columnInfo.entries()).map(([name, info]) => ({ name, type: info.type, nullable: info.nullable })))
    
    // Filter out empty values and only include columns that exist in the table
    const validEntries = Object.entries(values).filter(([key, value]) => {
      // Skip auto-managed columns (id, createdAt, updatedAt)
      if (['id', 'createdAt', 'updatedAt'].includes(key)) {
        console.log(`Skipping ${key}: auto-managed column`)
        return false
      }
      
      // Only include if column exists in table
      if (!columnInfo.has(key)) {
        console.log(`Skipping ${key}: column doesn't exist in table`)
        return false
      }
      
      // Allow empty values for nullable columns
      const colInfo = columnInfo.get(key)
      if ((value === '' || value === null || value === undefined) && colInfo?.nullable === 'NO') {
        console.log(`Skipping ${key}: empty value for required column`)
        return false
      }
      
      return true
    })
    
    if (validEntries.length === 0) {
      throw new BadRequestException('No valid columns to insert')
    }
    
    console.log('Valid entries to insert:', validEntries)
    
    const cols = validEntries.map(([k]) => `"${k}"`).join(', ')
    const vals = validEntries.map(([k, v]) => {
      const value = v
      const colData = columnInfo.get(k)
      const dataType = colData?.type
      
      // Handle null/empty values
      if (value === null || value === undefined || value === '') return null
      
      // Type conversions
      if (dataType === 'integer' || dataType === 'bigint' || dataType === 'smallint') {
        const parsed = parseInt(value, 10)
        return isNaN(parsed) ? null : parsed
      }
      if (dataType === 'numeric' || dataType === 'decimal' || dataType === 'real' || dataType === 'double precision') {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? null : parsed
      }
      if (dataType === 'boolean') {
        return value === 'true' || value === true || value === '1' || value === 1
      }
      if (dataType === 'timestamp without time zone' || dataType === 'timestamp with time zone' || dataType === 'date') {
        // Handle timestamp fields - convert to proper Date object
        if (value instanceof Date) return value
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : date
      }
      
      // Return as string for text/varchar fields
      return String(value)
    })
    
    const placeholders = vals.map((_, i) => `$${i+1}`).join(', ')
    
    console.log('SQL:', `INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`)
    console.log('Values:', vals)
    console.log('=== END DEBUG ===')
    
    return this.prisma.$executeRawUnsafe(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`, ...vals)
  }
  async updateRow(table: string, original: any, values: any) {
    const pk = await this.prisma.$queryRaw<{ column_name: string }[]>`
      SELECT a.attname AS column_name
      FROM   pg_index i
      JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE  i.indrelid = ${`"${table}"`}::regclass AND i.indisprimary
    `
    const pkCol = pk[0]?.column_name
    if (!pkCol || original[pkCol] === undefined) throw new BadRequestException('Primary key missing')
    const setCols = Object.keys(values).filter(k => k !== pkCol)
    const setSql = setCols.map((k, i) => `"${k}" = $${i+1}`).join(', ')
    const setVals = setCols.map(k => values[k])
    const whereVal = original[pkCol]
    return this.prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET ${setSql} WHERE "${pkCol}" = $${setVals.length+1}`,
      ...setVals, whereVal
    )
  }
  async createTable(tableName: string, columns: { name: string; type: string; nullable: boolean }[]) {
    if (!tableName) throw new BadRequestException('Table name required')
    if (!Array.isArray(columns) || !columns.length) throw new BadRequestException('Columns required')
    const colsSql = columns.map(c => {
      if (!c.name || !ALLOWED_TYPES.has(c.type)) throw new BadRequestException('Invalid column')
      const t = typeMap[c.type]; const n = c.nullable ? '' : 'NOT NULL'
      return `"${c.name}" ${t} ${n}`.trim()
    }).join(', ')
    return this.prisma.$executeRawUnsafe(`CREATE TABLE "${tableName}" (${colsSql});`)
  }
}

