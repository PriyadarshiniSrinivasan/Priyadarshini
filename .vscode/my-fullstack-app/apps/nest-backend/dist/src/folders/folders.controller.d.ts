import { FoldersService } from './folders.service';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    getFolderTree(includeFiles?: string): Promise<any[]>;
    getFolder(id: number): Promise<any>;
    getFolderPath(id: number): Promise<{
        id: number;
        name: string;
    }[]>;
    createFolder(body: {
        name: string;
        parentId?: number;
    }): Promise<any>;
    updateFolder(id: number, body: {
        name?: string;
        parentId?: number;
    }): Promise<any>;
    moveFolder(id: number, body: {
        parentId: number | null;
        order: number;
    }): Promise<any>;
    deleteFolder(id: number): Promise<any>;
}
