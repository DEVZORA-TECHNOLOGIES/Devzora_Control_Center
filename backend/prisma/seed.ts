import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devzora.com' },
    update: {},
    create: {
      email: 'admin@devzora.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+256700000000'
    }
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample client
  const client = await prisma.client.create({
    data: {
      name: 'Golden Hill Restaurant',
      email: 'contact@goldenhill.com',
      phone: '+256700000001',
      industry: 'Hospitality',
      city: 'Kampala',
      country: 'Uganda'
    }
  })

  console.log('✅ Created sample client:', client.name)

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Golden Hill RMS Deployment',
      description: 'Restaurant Management System implementation',
      clientId: client.id,
      ownerId: admin.id,
      startDate: new Date(),
      targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      milestones: {
        create: [
          { name: 'Requirements workshop', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
          { name: 'System configuration', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
          { name: 'Staff training', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
          { name: 'Go-live', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        ]
      }
    }
  })

  console.log('✅ Created sample project:', project.name)

  // Create sample subscription
  const subscription = await prisma.subscription.create({
    data: {
      productName: 'Restaurant Management System',
      plan: 'Standard',
      amount: 1200000,
      billingCycle: 'MONTHLY',
      startDate: new Date(),
      nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clientId: client.id
    }
  })

  console.log('✅ Created sample subscription')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


