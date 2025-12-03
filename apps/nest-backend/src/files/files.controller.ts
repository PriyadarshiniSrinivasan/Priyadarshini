import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { OktaJwtGuard } from '../auth/okta-jwt.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(OktaJwtGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ 
    summary: 'Upload File',
    description: 'Upload a file to the server with optional metadata. Supports various file types including images, PDFs, and Office documents. Maximum file size is 10MB.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file type or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv)$/i;
        if (allowedTypes.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Body() body: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    console.log('Upload request body:', body);
    console.log('FolderId received:', body.folderId);

    // Normalize the file path for Windows
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
      uploadedBy: 1, // Default user for now
    };

    console.log('Creating file with data:', fileData);

    return this.filesService.createFile(fileData);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get All Files',
    description: 'Retrieve all files with optional filtering by category, search term, and folder'
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', example: 'documents' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by filename or description', example: 'report' })
  @ApiQuery({ name: 'folderId', required: false, description: 'Filter by folder ID', example: '1' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getAllFiles(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.filesService.getAllFiles({ 
      category, 
      search,
      folderId: folderId ? parseInt(folderId) : undefined
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get File by ID',
    description: 'Retrieve detailed information about a specific file'
  })
  @ApiParam({ name: 'id', description: 'File ID', example: 1 })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getFile(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getFileById(id);
  }

  @Get(':id/download')
  @ApiOperation({ 
    summary: 'Download File',
    description: 'Download the actual file content by ID'
  })
  @ApiParam({ name: 'id', description: 'File ID', example: 1 })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'File not found or physical file missing' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getFileById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Handle Windows file paths properly
    const filePath = join(process.cwd(), file.filePath);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    return res.sendFile(filePath);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update File Metadata',
    description: 'Update file description, category, or folder assignment'
  })
  @ApiParam({ name: 'id', description: 'File ID', example: 1 })
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { description?: string; category?: string; folderId?: number | null },
  ) {
    return this.filesService.updateFile(id, updateData);
  }

  @Put(':id/move')
  @ApiOperation({ 
    summary: 'Move File',
    description: 'Move a file to a different folder with a specific order'
  })
  @ApiParam({ name: 'id', description: 'File ID', example: 1 })
  @ApiBody({
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
  })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 404, description: 'File or folder not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async moveFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { folderId: number | null; order: number },
  ) {
    return this.filesService.moveFile(id, body.folderId, body.order);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete File',
    description: 'Delete a file and its metadata from the system'
  })
  @ApiParam({ name: 'id', description: 'File ID', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.deleteFile(id);
  }
}