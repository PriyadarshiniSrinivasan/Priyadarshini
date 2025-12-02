import { PrismaService } from '../prisma/prisma.service';
export declare class MaterialsService {
    private prisma;
    constructor(prisma: PrismaService);
    search(filters: {
        department?: string;
        category?: string;
        name?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        code: string;
        category: string | null;
        department: string | null;
        quantity: number;
        unit: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        updatedAt: Date;
    }[]>;
    create(data: any): import(".prisma/client").Prisma.Prisma__MaterialsClient<{
        id: number;
        name: string;
        createdAt: Date;
        code: string;
        category: string | null;
        department: string | null;
        quantity: number;
        unit: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, data: any): import(".prisma/client").Prisma.Prisma__MaterialsClient<{
        id: number;
        name: string;
        createdAt: Date;
        code: string;
        category: string | null;
        department: string | null;
        quantity: number;
        unit: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
