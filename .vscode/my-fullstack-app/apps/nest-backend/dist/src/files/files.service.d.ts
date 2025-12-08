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
    }): Promise<any>;
    getAllFiles(filters: {
        category?: string;
        search?: string;
        folderId?: number;
    }): Promise<any>;
    getFileById(id: number): Promise<any>;
    updateFile(id: number, updateData: {
        description?: string;
        category?: string;
        folderId?: number | null;
    }): Promise<any>;
    moveFile(id: number, targetFolderId: number | null, newOrder: number): Promise<any>;
    deleteFile(id: number): Promise<any>;
    getFileStats(): Promise<{
        totalFiles: any;
        totalSize: any;
        categories: any;
    }>;
}
