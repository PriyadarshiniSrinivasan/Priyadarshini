"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ALLOWED_TYPES = new Set(['text', 'integer', 'numeric', 'boolean', 'timestamp']);
const typeMap = {
    text: 'TEXT', integer: 'INTEGER', numeric: 'NUMERIC(12,2)', boolean: 'BOOLEAN', timestamp: 'TIMESTAMP',
};
let TablesService = class TablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listTables() {
        return this.prisma.$queryRaw `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `;
    }
    getColumns(table) {
        return this.prisma.$queryRaw `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
      ORDER BY ordinal_position
    `;
    }
    getRows(table) {
        return this.prisma.$queryRawUnsafe(`SELECT * FROM "${table}" LIMIT 500`);
    }
    async insertRow(table, values) {
        console.log('=== INSERT ROW DEBUG ===');
        console.log('Table:', table);
        console.log('Values received:', values);
        const columns = await this.getColumns(table);
        const columnInfo = new Map(columns.map(c => [c.column_name, { type: c.data_type, nullable: c.is_nullable }]));
        console.log('Column info:', Array.from(columnInfo.entries()).map(([name, info]) => ({ name, ...info })));
        const validEntries = Object.entries(values).filter(([key, value]) => {
            if (['id', 'createdAt', 'updatedAt'].includes(key)) {
                console.log(`Skipping ${key}: auto-managed column`);
                return false;
            }
            if (!columnInfo.has(key)) {
                console.log(`Skipping ${key}: column doesn't exist in table`);
                return false;
            }
            const colInfo = columnInfo.get(key);
            if ((value === '' || value === null || value === undefined) && colInfo?.nullable === 'NO') {
                console.log(`Skipping ${key}: empty value for required column`);
                return false;
            }
            return true;
        });
        if (validEntries.length === 0) {
            throw new common_1.BadRequestException('No valid columns to insert');
        }
        console.log('Valid entries to insert:', validEntries);
        const cols = validEntries.map(([k]) => `"${k}"`).join(', ');
        const vals = validEntries.map(([k, v]) => {
            const value = v;
            const dataType = columnInfo.get(k)?.type;
            if (value === null || value === undefined || value === '')
                return null;
            if (dataType === 'integer' || dataType === 'bigint' || dataType === 'smallint') {
                const parsed = parseInt(value, 10);
                return isNaN(parsed) ? null : parsed;
            }
            if (dataType === 'numeric' || dataType === 'decimal' || dataType === 'real' || dataType === 'double precision') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? null : parsed;
            }
            if (dataType === 'boolean') {
                return value === 'true' || value === true || value === '1' || value === 1;
            }
            if (dataType === 'timestamp without time zone' || dataType === 'timestamp with time zone' || dataType === 'date') {
                if (value instanceof Date)
                    return value;
                const date = new Date(value);
                return isNaN(date.getTime()) ? null : date;
            }
            return String(value);
        });
        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        console.log('SQL:', `INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`);
        console.log('Values:', vals);
        console.log('=== END DEBUG ===');
        return this.prisma.$executeRawUnsafe(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`, ...vals);
    }
    async updateRow(table, original, values) {
        const pk = await this.prisma.$queryRaw `
      SELECT a.attname AS column_name
      FROM   pg_index i
      JOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE  i.indrelid = ${`"${table}"`}::regclass AND i.indisprimary
    `;
        const pkCol = pk[0]?.column_name;
        if (!pkCol || original[pkCol] === undefined)
            throw new common_1.BadRequestException('Primary key missing');
        const setCols = Object.keys(values).filter(k => k !== pkCol);
        const setSql = setCols.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const setVals = setCols.map(k => values[k]);
        const whereVal = original[pkCol];
        return this.prisma.$executeRawUnsafe(`UPDATE "${table}" SET ${setSql} WHERE "${pkCol}" = $${setVals.length + 1}`, ...setVals, whereVal);
    }
    async createTable(tableName, columns) {
        if (!tableName)
            throw new common_1.BadRequestException('Table name required');
        if (!Array.isArray(columns) || !columns.length)
            throw new common_1.BadRequestException('Columns required');
        const colsSql = columns.map(c => {
            if (!c.name || !ALLOWED_TYPES.has(c.type))
                throw new common_1.BadRequestException('Invalid column');
            const t = typeMap[c.type];
            const n = c.nullable ? '' : 'NOT NULL';
            return `"${c.name}" ${t} ${n}`.trim();
        }).join(', ');
        return this.prisma.$executeRawUnsafe(`CREATE TABLE "${tableName}" (${colsSql});`);
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map