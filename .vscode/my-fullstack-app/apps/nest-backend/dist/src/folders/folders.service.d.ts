import { PrismaService } from '../prisma/prisma.service';
export declare class FoldersService {
    private prisma;
    constructor(prisma: PrismaService);
    getFolderTree(includeFiles?: boolean): Promise<any[]>;
    private buildTree;
    getFolder(id: number): Promise<any>;
    createFolder(data: {
        name: string;
        parentId?: number;
    }): Promise<any>;
    updateFolder(id: number, data: {
        name?: string;
        parentId?: number;
    }): Promise<any>;
    deleteFolder(id: number): Promise<any>;
    moveFolder(id: number, targetParentId: number | null, newOrder: number): Promise<any>;
    private wouldCreateCircularReference;
    getFolderPath(id: number): Promise<{
        id: number;
        name: string;
    }[]>;
}
