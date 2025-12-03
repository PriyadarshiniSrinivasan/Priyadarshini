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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
let FilesService = class FilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFile(fileData) {
        console.log('Creating file with data:', fileData);
        const result = await this.prisma.file.create({
            data: fileData,
        });
        console.log('File created successfully:', result);
        return result;
    }
    async getAllFiles(filters) {
        const where = {};
        if (filters.folderId !== undefined) {
            where.folderId = filters.folderId;
        }
        if (filters.category && filters.category !== 'all') {
            where.category = filters.category;
        }
        if (filters.search) {
            where.OR = [
                { originalName: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        console.log('Fetching files with filters:', filters, 'where:', where);
        return this.prisma.file.findMany({
            where,
            orderBy: [
                { createdAt: 'desc' },
            ],
            include: {
                folder: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });
    }
    async getFileById(id) {
        const file = await this.prisma.file.findUnique({
            where: { id },
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async updateFile(id, updateData) {
        const file = await this.getFileById(id);
        return this.prisma.file.update({
            where: { id },
            data: updateData,
        });
    }
    async moveFile(id, targetFolderId, newOrder) {
        const file = await this.getFileById(id);
        const siblings = await this.prisma.file.findMany({
            where: {
                folderId: targetFolderId,
                id: { not: id }
            },
            orderBy: { order: 'asc' }
        });
        await this.prisma.$transaction(async (tx) => {
            await tx.file.update({
                where: { id },
                data: {
                    folderId: targetFolderId,
                    order: newOrder
                }
            });
            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];
                const siblingOrder = i >= newOrder ? i + 1 : i;
                if (sibling.order !== siblingOrder) {
                    await tx.file.update({
                        where: { id: sibling.id },
                        data: { order: siblingOrder }
                    });
                }
            }
        });
        return this.getFileById(id);
    }
    async deleteFile(id) {
        const file = await this.getFileById(id);
        const fullPath = (0, path_1.join)(process.cwd(), file.filePath);
        if ((0, fs_1.existsSync)(fullPath)) {
            try {
                await (0, promises_1.unlink)(fullPath);
            }
            catch (error) {
                console.error('Error deleting physical file:', error);
            }
        }
        return this.prisma.file.delete({
            where: { id },
        });
    }
    async getFileStats() {
        const totalFiles = await this.prisma.file.count();
        const totalSize = await this.prisma.file.aggregate({
            _sum: { fileSize: true },
        });
        const categories = await this.prisma.file.groupBy({
            by: ['category'],
            _count: { category: true },
        });
        return {
            totalFiles,
            totalSize: totalSize._sum.fileSize || 0,
            categories,
        };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map