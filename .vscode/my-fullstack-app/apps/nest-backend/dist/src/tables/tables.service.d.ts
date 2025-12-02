import { PrismaService } from '../prisma/prisma.service';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    listTables(): import(".prisma/client").Prisma.PrismaPromise<{
        table_name: string;
    }[]>;
    getColumns(table: string): import(".prisma/client").Prisma.PrismaPromise<{
        column_name: string;
        data_type: string;
        is_nullable: "YES" | "NO";
    }[]>;
    getRows(table: string): import(".prisma/client").Prisma.PrismaPromise<unknown>;
    insertRow(table: string, values: Record<string, any>): Promise<number>;
    updateRow(table: string, original: any, values: any): Promise<number>;
    createTable(tableName: string, columns: {
        name: string;
        type: string;
        nullable: boolean;
    }[]): Promise<number>;
}
