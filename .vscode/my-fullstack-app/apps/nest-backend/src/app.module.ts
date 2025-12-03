// src/app.module.ts
import { Module } from '@nestjs/common'

// Core modules of your app (ensure these files exist as created earlier)
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { MaterialsModule } from './materials/materials.module'
import { TablesModule } from './tables/tables.module'
import { FilesModule } from './files/files.module'
import { FoldersModule } from './folders/folders.module'

// Root controller & service
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  // Register feature modules here
  imports: [
    PrismaModule,     // Provides PrismaService globally
    AuthModule,       // /auth/login -> returns JWT
    MaterialsModule,  // /materials   -> filtered list & CRUD via Prisma
    TablesModule,     // /tables      -> list/columns/rows/create/update (generic admin)
    FoldersModule,    // /folders     -> hierarchical folder structure
    FilesModule,      // /files       -> file upload, view, update, delete
  ],
  controllers: [AppController], // Root-level routes (/, /health)
  providers: [AppService],      // Root-level providers/services
})
export class AppModule {}