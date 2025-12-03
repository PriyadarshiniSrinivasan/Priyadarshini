"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcryptjs_1.default.hash('admin123', 10);
    const users = [
        { email: 'admin@example.com', password: hash, name: 'Admin' },
        { email: 'example@example.com', password: hash, name: 'Example' },
        { email: 'user@example.com', password: hash, name: 'User' }
    ];
    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData
        });
        console.log('👤 User created/updated:', user);
    }
    const materials = await prisma.materials.createMany({
        data: [
            { code: 'MAT-001', name: 'Steel Rod', category: 'Metal', department: 'Fabrication', quantity: 120, unit: 'pcs', price: '250.00' },
            { code: 'MAT-002', name: 'Copper Wire', category: 'Metal', department: 'Electrical', quantity: 50, unit: 'm', price: '80.00' },
            { code: 'MAT-003', name: 'Paint', category: 'Chemical', department: 'Finishing', quantity: 30, unit: 'kg', price: '500.00' },
        ],
        skipDuplicates: true,
    });
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map