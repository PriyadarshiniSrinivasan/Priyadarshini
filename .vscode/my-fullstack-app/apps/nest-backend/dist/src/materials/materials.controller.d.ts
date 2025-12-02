import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private svc;
    constructor(svc: MaterialsService);
    list(department?: string, category?: string, name?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    create(body: any): import(".prisma/client").Prisma.Prisma__MaterialsClient<{
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
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__MaterialsClient<{
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
