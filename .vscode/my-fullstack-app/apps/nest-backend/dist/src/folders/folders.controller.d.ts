import { FoldersService } from './folders.service';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    getFolderTree(includeFiles?: string): Promise<any[]>;
    getFolder(id: number): Promise<{
        parent: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            parentId: number | null;
        };
        children: ({
            _count: {
                children: number;
                files: number;
            };
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            parentId: number | null;
        })[];
        files: {
            id: number;
            createdAt: Date;
            description: string | null;
            category: string | null;
            updatedAt: Date;
            filename: string;
            originalName: string;
            mimeType: string;
            fileSize: number;
            filePath: string;
            uploadedBy: number;
            order: number;
            folderId: number | null;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
    getFolderPath(id: number): Promise<{
        id: number;
        name: string;
    }[]>;
    createFolder(body: {
        name: string;
        parentId?: number;
    }): Promise<{
        _count: {
            children: number;
            files: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
    updateFolder(id: number, body: {
        name?: string;
        parentId?: number;
    }): Promise<{
        _count: {
            children: number;
            files: number;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
    moveFolder(id: number, body: {
        parentId: number | null;
        order: number;
    }): Promise<{
        parent: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            parentId: number | null;
        };
        children: ({
            _count: {
                children: number;
                files: number;
            };
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            parentId: number | null;
        })[];
        files: {
            id: number;
            createdAt: Date;
            description: string | null;
            category: string | null;
            updatedAt: Date;
            filename: string;
            originalName: string;
            mimeType: string;
            fileSize: number;
            filePath: string;
            uploadedBy: number;
            order: number;
            folderId: number | null;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
    deleteFolder(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
}
