import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  // Get all folders with their hierarchical structure
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

    // Build tree structure
    return this.buildTree(folders, null);
  }

  // Helper to build tree from flat list
  private buildTree(folders: any[], parentId: number | null): any[] {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: this.buildTree(folders, folder.id)
      }));
  }

  // Get single folder with its contents
  async getFolder(id: number) {
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
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  // Create new folder
  async createFolder(data: { name: string; parentId?: number }) {
    // Get the next order number for siblings
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

  // Update folder (rename or move)
  async updateFolder(id: number, data: { name?: string; parentId?: number }) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Prevent circular references
    if (data.parentId !== undefined) {
      const isCircular = await this.wouldCreateCircularReference(id, data.parentId);
      if (isCircular) {
        throw new BadRequestException('Cannot move folder: would create circular reference');
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

  // Delete folder (and optionally its contents)
  async deleteFolder(id: number) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: { files: true, children: true }
        }
      }
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Delete folder (cascade will handle children and set files.folderId to null)
    return this.prisma.folder.delete({
      where: { id }
    });
  }

  // Move folder to different parent or reorder
  async moveFolder(id: number, targetParentId: number | null, newOrder: number) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Prevent circular references
    if (targetParentId !== null) {
      const isCircular = await this.wouldCreateCircularReference(id, targetParentId);
      if (isCircular) {
        throw new BadRequestException('Cannot move folder: would create circular reference');
      }
    }

    // Get siblings in the target location
    const siblings = await this.prisma.folder.findMany({
      where: { 
        parentId: targetParentId,
        id: { not: id }
      },
      orderBy: { order: 'asc' }
    });

    // Update orders
    await this.prisma.$transaction(async (tx) => {
      // Update the moved folder
      await tx.folder.update({
        where: { id },
        data: {
          parentId: targetParentId,
          order: newOrder
        }
      });

      // Reorder siblings
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

  // Check if moving would create circular reference
  private async wouldCreateCircularReference(folderId: number, newParentId: number | null): Promise<boolean> {
    if (newParentId === null) return false;
    if (folderId === newParentId) return true;

    let currentParentId = newParentId;
    
    while (currentParentId !== null) {
      if (currentParentId === folderId) {
        return true;
      }
      
      const parent = await this.prisma.folder.findUnique({
        where: { id: currentParentId },
        select: { parentId: true }
      });
      
      if (!parent) break;
      currentParentId = parent.parentId;
    }

    return false;
  }

  // Get breadcrumb path for a folder
  async getFolderPath(id: number): Promise<{ id: number; name: string }[]> {
    const path: { id: number; name: string }[] = [];
    let currentId: number | null = id;

    while (currentId !== null) {
      const folder = await this.prisma.folder.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true }
      });

      if (!folder) break;

      path.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
    }

    return path;
  }
}
