import { Response } from 'express';
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: any, body: any): Promise<any>;
    getAllFiles(category?: string, search?: string, folderId?: string): Promise<any>;
    getFile(id: number): Promise<any>;
    downloadFile(id: number, res: Response): Promise<void | Response<any, Record<string, any>>>;
    updateFile(id: number, updateData: {
        description?: string;
        category?: string;
        folderId?: number | null;
    }): Promise<any>;
    moveFile(id: number, body: {
        folderId: number | null;
        order: number;
    }): Promise<any>;
    deleteFile(id: number): Promise<any>;
}
