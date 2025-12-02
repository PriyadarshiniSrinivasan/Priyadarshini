import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}
  search(filters: { department?: string; category?: string; name?: string }) {
    return this.prisma.materials.findMany({
      where: {
        department: filters.department || undefined,
        category: filters.category || undefined,
        name: filters.name ? { contains: filters.name, mode: 'insensitive' } : undefined,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })
  }
  create(data: any) { return this.prisma.materials.create({ data }) }
  update(id: number, data: any) { return this.prisma.materials.update({ where: { id }, data }) }
}
