import { TablesService } from './tables.service';
export declare class TablesController {
    private svc;
    constructor(svc: TablesService);
    list(): import(".prisma/client").Prisma.PrismaPromise<{
        table_name: string;
    }[]>;
    columns(table: string): import(".prisma/client").Prisma.PrismaPromise<{
        column_name: string;
        data_type: string;
        is_nullable: "YES" | "NO";
    }[]>;
    rows(table: string): import(".prisma/client").Prisma.PrismaPromise<unknown>;
    insert(table: string, body: {
        values: Record<string, any>;
    }): Promise<{
        ok: boolean;
    }>;
    update(table: string, body: {
        original: any;
        values: any;
    }): Promise<{
        ok: boolean;
    }>;
    create(body: {
        tableName: string;
        columns: {
            name: string;
            type: string;
            nullable: boolean;
        }[];
    }): Promise<{
        ok: boolean;
    }>;
}
