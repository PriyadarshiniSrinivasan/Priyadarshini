import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { TablesService } from './tables.service'
import { TablesController } from './tables.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TablesService],
  controllers: [TablesController],
})
export class TablesModule {}
