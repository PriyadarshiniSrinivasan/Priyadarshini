import { PrismaService } from '../prisma/prisma.service';
export declare class FilesService {
    private prisma;
    constructor(prisma: PrismaService);
    createFile(fileData: {
        filename: string;
        originalName: string;
        mimeType: string;
        fileSize: number;
        filePath: string;
        description?: string;
        category?: string;
        folderId?: number | null;
        uploadedBy: number;
    }): Promise<{
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
    }>;
    getAllFiles(filters: {
        category?: string;
        search?: string;
        folderId?: number;
    }): Promise<({
        folder: {
            id: number;
            name: string;
        };
    } & {
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
    })[]>;
    getFileById(id: number): Promise<{
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
    }>;
    updateFile(id: number, updateData: {
        description?: string;
        category?: string;
        folderId?: number | null;
    }): Promise<{
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
    }>;
    moveFile(id: number, targetFolderId: number | null, newOrder: number): Promise<{
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
    }>;
    deleteFile(id: number): Promise<{
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
    }>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        categories: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.FileGroupByOutputType, "category"[]> & {
            _count: {
                category: number;
            };
        })[];
    }>;
}
