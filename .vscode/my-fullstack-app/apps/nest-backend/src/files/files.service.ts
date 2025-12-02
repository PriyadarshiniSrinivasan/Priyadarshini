import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async createFile(fileData: {
    filename: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    category?: string;
    folderId?: number | null;
    uploadedBy: number;
  }) {
    console.log('Creating file with data:', fileData);
    const result = await this.prisma.file.create({
      data: fileData,
    });
    console.log('File created successfully:', result);
    return result;
  }

  async getAllFiles(filters: { category?: string; search?: string; folderId?: number }) {
    const where: any = {};

    // Only filter by folder if folderId is explicitly provided
    // undefined means "all files", null or number means "filter by that folder"
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

  async getFileById(id: number) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async updateFile(
    id: number,
    updateData: { description?: string; category?: string; folderId?: number | null },
  ) {
    const file = await this.getFileById(id);

    return this.prisma.file.update({
      where: { id },
      data: updateData,
    });
  }

  async moveFile(id: number, targetFolderId: number | null, newOrder: number) {
    const file = await this.getFileById(id);

    // Get siblings in the target location
    const siblings = await this.prisma.file.findMany({
      where: { 
        folderId: targetFolderId,
        id: { not: id }
      },
      orderBy: { order: 'asc' }
    });

    // Update orders in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update the moved file
      await tx.file.update({
        where: { id },
        data: {
          folderId: targetFolderId,
          order: newOrder
        }
      });

      // Reorder siblings
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

  async deleteFile(id: number) {
    const file = await this.getFileById(id);

    // Delete physical file - handle Windows paths
    const fullPath = join(process.cwd(), file.filePath);
    if (existsSync(fullPath)) {
      try {
        await unlink(fullPath);
      } catch (error) {
        console.error('Error deleting physical file:', error);
      }
    }

    // Delete database record
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
}