import { PrismaService } from '../prisma/prisma.service';
export declare class MaterialsService {
    private prisma;
    constructor(prisma: PrismaService);
    search(filters: {
        department?: string;
        category?: string;
        name?: string;
    }): any;
    create(data: any): any;
    update(id: number, data: any): any;
}
