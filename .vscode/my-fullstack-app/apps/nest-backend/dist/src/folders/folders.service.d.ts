import { PrismaService } from '../prisma/prisma.service';
export declare class FoldersService {
    private prisma;
    constructor(prisma: PrismaService);
    getFolderTree(includeFiles?: boolean): Promise<any[]>;
    private buildTree;
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
    createFolder(data: {
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
    updateFolder(id: number, data: {
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
    deleteFolder(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        order: number;
        parentId: number | null;
    }>;
    moveFolder(id: number, targetParentId: number | null, newOrder: number): Promise<{
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
    private wouldCreateCircularReference;
    getFolderPath(id: number): Promise<{
        id: number;
        name: string;
    }[]>;
}
