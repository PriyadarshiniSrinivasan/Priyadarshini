import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MaterialsService } from './materials.service'
import { MaterialsController } from './materials.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [MaterialsService],
  controllers: [MaterialsController],
})
export class MaterialsModule {}
