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
exports.FoldersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const folders_service_1 = require("./folders.service");
const okta_jwt_guard_1 = require("../auth/okta-jwt.guard");
let FoldersController = class FoldersController {
    foldersService;
    constructor(foldersService) {
        this.foldersService = foldersService;
    }
    async getFolderTree(includeFiles) {
        return this.foldersService.getFolderTree(includeFiles === 'true');
    }
    async getFolder(id) {
        return this.foldersService.getFolder(id);
    }
    async getFolderPath(id) {
        return this.foldersService.getFolderPath(id);
    }
    async createFolder(body) {
        return this.foldersService.createFolder(body);
    }
    async updateFolder(id, body) {
        return this.foldersService.updateFolder(id, body);
    }
    async moveFolder(id, body) {
        return this.foldersService.moveFolder(id, body.parentId, body.order);
    }
    async deleteFolder(id) {
        return this.foldersService.deleteFolder(id);
    }
};
exports.FoldersController = FoldersController;
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Folder Tree',
        description: 'Retrieve the complete folder hierarchy tree structure, optionally including files within each folder'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeFiles',
        required: false,
        description: 'Include files in the tree structure',
        example: 'true',
        type: 'string',
        enum: ['true', 'false']
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder tree retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Documents' },
                    parentId: { type: 'number', example: null, nullable: true },
                    order: { type: 'number', example: 1 },
                    children: {
                        type: 'array',
                        description: 'Nested child folders',
                        items: { type: 'object' }
                    },
                    files: {
                        type: 'array',
                        description: 'Files in this folder (if includeFiles=true)',
                        items: { type: 'object' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Query)('includeFiles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "getFolderTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Folder by ID',
        description: 'Retrieve detailed information about a specific folder'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder details retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Documents' },
                parentId: { type: 'number', example: null, nullable: true },
                order: { type: 'number', example: 1 },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "getFolder", null);
__decorate([
    (0, common_1.Get)(':id/path'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Folder Path',
        description: 'Retrieve the complete path from root to the specified folder (breadcrumb trail)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder path retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: 'Documents' },
                    parentId: { type: 'number', example: null, nullable: true }
                }
            },
            example: [
                { id: 1, name: 'Root', parentId: null },
                { id: 2, name: 'Documents', parentId: 1 },
                { id: 3, name: 'Reports', parentId: 2 }
            ]
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "getFolderPath", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create New Folder',
        description: 'Create a new folder, optionally within a parent folder'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Folder name',
                    example: 'New Folder'
                },
                parentId: {
                    type: 'number',
                    description: 'Parent folder ID (null for root level)',
                    example: 1,
                    nullable: true
                }
            },
            required: ['name']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Folder created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 4 },
                name: { type: 'string', example: 'New Folder' },
                parentId: { type: 'number', example: 1, nullable: true },
                order: { type: 'number', example: 1 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid folder data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update Folder',
        description: 'Update folder name or move it to a different parent folder'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'New folder name',
                    example: 'Renamed Folder'
                },
                parentId: {
                    type: 'number',
                    description: 'New parent folder ID',
                    example: 2,
                    nullable: true
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Renamed Folder' },
                parentId: { type: 'number', example: 2, nullable: true }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Cannot move folder into itself or its descendants' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    (0, swagger_1.ApiOperation)({
        summary: 'Move Folder',
        description: 'Move a folder to a different parent with a specific order'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                parentId: {
                    type: 'number',
                    description: 'New parent folder ID (null for root level)',
                    example: 2,
                    nullable: true
                },
                order: {
                    type: 'number',
                    description: 'Display order within the parent folder',
                    example: 1
                }
            },
            required: ['parentId', 'order']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder moved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                parentId: { type: 'number', example: 2, nullable: true },
                order: { type: 'number', example: 1 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Cannot move folder into itself or its descendants' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "moveFolder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete Folder',
        description: 'Delete a folder and all its contents (files and subfolders)'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID', example: 1 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Folder deleted successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "deleteFolder", null);
exports.FoldersController = FoldersController = __decorate([
    (0, swagger_1.ApiTags)('Folders'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('folders'),
    (0, common_1.UseGuards)(okta_jwt_guard_1.OktaJwtGuard),
    __metadata("design:paramtypes", [folders_service_1.FoldersService])
], FoldersController);
//# sourceMappingURL=folders.controller.js.map