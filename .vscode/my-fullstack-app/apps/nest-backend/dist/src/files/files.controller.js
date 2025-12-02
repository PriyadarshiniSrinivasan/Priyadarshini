"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const okta_jwt_guard_1 = require("../auth/okta-jwt.guard");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file, body) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        console.log('Upload request body:', body);
        console.log('FolderId received:', body.folderId);
        const normalizedPath = file.path.replace(/\\/g, '/');
        const fileData = {
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            filePath: normalizedPath,
            description: body.description || null,
            category: body.category || 'general',
            folderId: body.folderId ? parseInt(body.folderId) : null,
            uploadedBy: 1,
        };
        console.log('Creating file with data:', fileData);
        return this.filesService.createFile(fileData);
    }
    async getAllFiles(category, search, folderId) {
        return this.filesService.getAllFiles({
            category,
            search,
            folderId: folderId ? parseInt(folderId) : undefined
        });
    }
    async getFile(id) {
        return this.filesService.getFileById(id);
    }
    async downloadFile(id, res) {
        const file = await this.filesService.getFileById(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        const filePath = (0, path_1.join)(process.cwd(), file.filePath);
        if (!(0, fs_1.existsSync)(filePath)) {
            return res.status(404).json({ message: 'Physical file not found' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimeType);
        return res.sendFile(filePath);
    }
    async updateFile(id, updateData) {
        return this.filesService.updateFile(id, updateData);
    }
    async moveFile(id, body) {
        return this.filesService.moveFile(id, body.folderId, body.order);
    }
    async deleteFile(id) {
        return this.filesService.deleteFile(id);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload File',
        description: 'Upload a file to the server with optional metadata. Supports various file types including images, PDFs, and Office documents. Maximum file size is 10MB.'
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (max 10MB)'
                },
                description: {
                    type: 'string',
                    description: 'Optional file description',
                    example: 'Project documentation'
                },
                category: {
                    type: 'string',
                    description: 'File category',
                    example: 'documents',
                    default: 'general'
                },
                folderId: {
                    type: 'number',
                    description: 'ID of the folder to upload to (optional)',
                    example: 1,
                    nullable: true
                }
            },
            required: ['file']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                filename: { type: 'string', example: 'abc123def456.pdf' },
                originalName: { type: 'string', example: 'document.pdf' },
                mimeType: { type: 'string', example: 'application/pdf' },
                fileSize: { type: 'number', example: 2048000 },
                filePath: { type: 'string', example: 'uploads/abc123def456.pdf' },
                category: { type: 'string', example: 'documents' },
                folderId: { type: 'number', example: 1, nullable: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid file type or file too large' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads');
                if (!(0, fs_1.existsSync)(uploadPath)) {
                    (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv)$/i;
            if (allowedTypes.test(file.originalname)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type'), false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get All Files',
        description: 'Retrieve all files with optional filtering by category, search term, and folder'
    }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category', example: 'documents' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by filename or description', example: 'report' }),
    (0, swagger_1.ApiQuery)({ name: 'folderId', required: false, description: 'Filter by folder ID', example: '1' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of files retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    filename: { type: 'string', example: 'abc123.pdf' },
                    originalName: { type: 'string', example: 'report.pdf' },
                    mimeType: { type: 'string', example: 'application/pdf' },
                    fileSize: { type: 'number', example: 2048000 },
                    category: { type: 'string', example: 'documents' },
                    folderId: { type: 'number', example: 1, nullable: true }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get File by ID',
        description: 'Retrieve detailed information about a specific file'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                filename: { type: 'string', example: 'abc123.pdf' },
                originalName: { type: 'string', example: 'report.pdf' },
                mimeType: { type: 'string', example: 'application/pdf' },
                fileSize: { type: 'number', example: 2048000 },
                filePath: { type: 'string', example: 'uploads/abc123.pdf' },
                description: { type: 'string', example: 'Annual report', nullable: true },
                category: { type: 'string', example: 'documents' },
                folderId: { type: 'number', example: 1, nullable: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({
        summary: 'Download File',
        description: 'Download the actual file content by ID'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File downloaded successfully',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found or physical file missing' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update File Metadata',
        description: 'Update file description, category, or folder assignment'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                description: {
                    type: 'string',
                    description: 'File description',
                    example: 'Updated description',
                    nullable: true
                },
                category: {
                    type: 'string',
                    description: 'File category',
                    example: 'reports'
                },
                folderId: {
                    type: 'number',
                    description: 'Folder ID (null to remove from folder)',
                    example: 2,
                    nullable: true
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File metadata updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                description: { type: 'string', example: 'Updated description' },
                category: { type: 'string', example: 'reports' },
                folderId: { type: 'number', example: 2, nullable: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "updateFile", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    (0, swagger_1.ApiOperation)({
        summary: 'Move File',
        description: 'Move a file to a different folder with a specific order'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                folderId: {
                    type: 'number',
                    description: 'Target folder ID (null for root)',
                    example: 2,
                    nullable: true
                },
                order: {
                    type: 'number',
                    description: 'Display order within the folder',
                    example: 1
                }
            },
            required: ['folderId', 'order']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File moved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                folderId: { type: 'number', example: 2, nullable: true },
                order: { type: 'number', example: 1 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File or folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "moveFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete File',
        description: 'Delete a file and its metadata from the system'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'File deleted successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(okta_jwt_guard_1.OktaJwtGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map