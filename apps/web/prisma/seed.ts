import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create user first
    const hashedPassword = await hash('00000', 12)
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      },
    })

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        url: 'test-workspace',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    })

    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        defaultHomeView: 'my-issues',
      },
    })

    console.log('Seed data created successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })