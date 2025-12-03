import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { OktaJwtGuard } from '../auth/okta-jwt.guard';

@ApiTags('Folders')
@ApiBearerAuth('JWT-auth')
@Controller('folders')
@UseGuards(OktaJwtGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get('tree')
  @ApiOperation({ 
    summary: 'Get Folder Tree',
    description: 'Retrieve the complete folder hierarchy tree structure, optionally including files within each folder'
  })
  @ApiQuery({ 
    name: 'includeFiles', 
    required: false, 
    description: 'Include files in the tree structure', 
    example: 'true',
    type: 'string',
    enum: ['true', 'false']
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getFolderTree(@Query('includeFiles') includeFiles?: string) {
    return this.foldersService.getFolderTree(includeFiles === 'true');
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get Folder by ID',
    description: 'Retrieve detailed information about a specific folder'
  })
  @ApiParam({ name: 'id', description: 'Folder ID', example: 1 })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getFolder(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.getFolder(id);
  }

  @Get(':id/path')
  @ApiOperation({ 
    summary: 'Get Folder Path',
    description: 'Retrieve the complete path from root to the specified folder (breadcrumb trail)'
  })
  @ApiParam({ name: 'id', description: 'Folder ID', example: 1 })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getFolderPath(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.getFolderPath(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create New Folder',
    description: 'Create a new folder, optionally within a parent folder'
  })
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid folder data' })
  @ApiResponse({ status: 404, description: 'Parent folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async createFolder(@Body() body: { name: string; parentId?: number }) {
    return this.foldersService.createFolder(body);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update Folder',
    description: 'Update folder name or move it to a different parent folder'
  })
  @ApiParam({ name: 'id', description: 'Folder ID', example: 1 })
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Cannot move folder into itself or its descendants' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async updateFolder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; parentId?: number },
  ) {
    return this.foldersService.updateFolder(id, body);
  }

  @Put(':id/move')
  @ApiOperation({ 
    summary: 'Move Folder',
    description: 'Move a folder to a different parent with a specific order'
  })
  @ApiParam({ name: 'id', description: 'Folder ID', example: 1 })
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Cannot move folder into itself or its descendants' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async moveFolder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { parentId: number | null; order: number },
  ) {
    return this.foldersService.moveFolder(id, body.parentId, body.order);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete Folder',
    description: 'Delete a folder and all its contents (files and subfolders)'
  })
  @ApiParam({ name: 'id', description: 'Folder ID', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Folder deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Folder deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async deleteFolder(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.deleteFolder(id);
  }
}
