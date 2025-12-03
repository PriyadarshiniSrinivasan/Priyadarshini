import { Response } from 'express';
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: any, body: any): Promise<{
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
    getAllFiles(category?: string, search?: string, folderId?: string): Promise<({
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
    getFile(id: number): Promise<{
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
    downloadFile(id: number, res: Response): Promise<void | Response<any, Record<string, any>>>;
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
    moveFile(id: number, body: {
        folderId: number | null;
        order: number;
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
}
