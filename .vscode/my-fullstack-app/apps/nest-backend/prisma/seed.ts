import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
 
  
  const hash = await bcrypt.hash('admin123', 10)
  const users = [
    { email: 'admin@example.com', password: hash, name: 'Admin' },
    { email: 'example@example.com', password: hash, name: 'Example' },
    { email: 'user@example.com', password: hash, name: 'User' }
  ]

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    })
    console.log('👤 User created/updated:', user)
  }

  const materials = await prisma.materials.createMany({
    data: [
      { code: 'MAT-001', name: 'Steel Rod', category: 'Metal', department: 'Fabrication', quantity: 120, unit: 'pcs', price: '250.00' },
      { code: 'MAT-002', name: 'Copper Wire', category: 'Metal', department: 'Electrical', quantity: 50, unit: 'm', price: '80.00' },
      { code: 'MAT-003', name: 'Paint', category: 'Chemical', department: 'Finishing', quantity: 30, unit: 'kg', price: '500.00' },
    ],
    skipDuplicates: true,
  })
  
}
main().finally(() => prisma.$disconnect())
