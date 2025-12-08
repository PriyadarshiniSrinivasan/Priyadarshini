import { TablesService } from './tables.service';
export declare class TablesController {
    private svc;
    constructor(svc: TablesService);
    list(): any;
    columns(table: string): any;
    rows(table: string): any;
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
