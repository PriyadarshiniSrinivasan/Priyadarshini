import { PrismaService } from '../prisma/prisma.service';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    listTables(): any;
    getColumns(table: string): any;
    getRows(table: string): any;
    insertRow(table: string, values: Record<string, any>): Promise<any>;
    updateRow(table: string, original: any, values: any): Promise<any>;
    createTable(tableName: string, columns: {
        name: string;
        type: string;
        nullable: boolean;
    }[]): Promise<any>;
}
