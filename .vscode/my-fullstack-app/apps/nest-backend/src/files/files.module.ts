import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {
  constructor() {
    this.createUploadsDirectory();
  }

  private async createUploadsDirectory() {
    const uploadsDir = './uploads';
    if (!existsSync(uploadsDir)) {
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory');
      } catch (error) {
        console.error('❌ Error creating uploads directory:', error);
      }
    }
  }
}