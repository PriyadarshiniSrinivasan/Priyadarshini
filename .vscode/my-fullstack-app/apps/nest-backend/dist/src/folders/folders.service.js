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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FoldersService = class FoldersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFolderTree(includeFiles = false) {
        const folders = await this.prisma.folder.findMany({
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { files: true, children: true }
                },
                ...(includeFiles && {
                    files: {
                        orderBy: { createdAt: 'desc' },
                        select: {
                            id: true,
                            filename: true,
                            originalName: true,
                            mimeType: true,
                            fileSize: true,
                            createdAt: true
                        }
                    }
                })
            }
        });
        return this.buildTree(folders, null);
    }
    buildTree(folders, parentId) {
        return folders
            .filter(folder => folder.parentId === parentId)
            .map(folder => ({
            ...folder,
            children: this.buildTree(folders, folder.id)
        }));
    }
    async getFolder(id) {
        const folder = await this.prisma.folder.findUnique({
            where: { id },
            include: {
                files: {
                    orderBy: { order: 'asc' }
                },
                children: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: {
                            select: { files: true, children: true }
                        }
                    }
                },
                parent: true
            }
        });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        return folder;
    }
    async createFolder(data) {
        const siblings = await this.prisma.folder.findMany({
            where: { parentId: data.parentId || null },
            orderBy: { order: 'desc' },
            take: 1
        });
        const order = siblings.length > 0 ? siblings[0].order + 1 : 0;
        return this.prisma.folder.create({
            data: {
                name: data.name,
                parentId: data.parentId || null,
                order
            },
            include: {
                _count: {
                    select: { files: true, children: true }
                }
            }
        });
    }
    async updateFolder(id, data) {
        const folder = await this.prisma.folder.findUnique({ where: { id } });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        if (data.parentId !== undefined) {
            const isCircular = await this.wouldCreateCircularReference(id, data.parentId);
            if (isCircular) {
                throw new common_1.BadRequestException('Cannot move folder: would create circular reference');
            }
        }
        return this.prisma.folder.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: { files: true, children: true }
                }
            }
        });
    }
    async deleteFolder(id) {
        const folder = await this.prisma.folder.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { files: true, children: true }
                }
            }
        });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        return this.prisma.folder.delete({
            where: { id }
        });
    }
    async moveFolder(id, targetParentId, newOrder) {
        const folder = await this.prisma.folder.findUnique({ where: { id } });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        if (targetParentId !== null) {
            const isCircular = await this.wouldCreateCircularReference(id, targetParentId);
            if (isCircular) {
                throw new common_1.BadRequestException('Cannot move folder: would create circular reference');
            }
        }
        const siblings = await this.prisma.folder.findMany({
            where: {
                parentId: targetParentId,
                id: { not: id }
            },
            orderBy: { order: 'asc' }
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.folder.update({
                where: { id },
                data: {
                    parentId: targetParentId,
                    order: newOrder
                }
            });
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                const siblingOrder = i >= newOrder ? i + 1 : i;
                if (sibling.order !== siblingOrder) {
                    await tx.folder.update({
                        where: { id: sibling.id },
                        data: { order: siblingOrder }
                    });
                }
            }
        });
        return this.getFolder(id);
    }
    async wouldCreateCircularReference(folderId, newParentId) {
        if (newParentId === null)
            return false;
        if (folderId === newParentId)
            return true;
        let currentParentId = newParentId;
        while (currentParentId !== null) {
            if (currentParentId === folderId) {
                return true;
            }
            const parent = await this.prisma.folder.findUnique({
                where: { id: currentParentId },
                select: { parentId: true }
            });
            if (!parent)
                break;
            currentParentId = parent.parentId;
        }
        return false;
    }
    async getFolderPath(id) {
        const path = [];
        let currentId = id;
        while (currentId !== null) {
            const folder = await this.prisma.folder.findUnique({
                where: { id: currentId },
                select: { id: true, name: true, parentId: true }
            });
            if (!folder)
                break;
            path.unshift({ id: folder.id, name: folder.name });
            currentId = folder.parentId;
        }
        return path;
    }
};
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FoldersService);
//# sourceMappingURL=folders.service.js.map