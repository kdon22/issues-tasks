import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create test user if not exists
    const user = await prisma.user.upsert({
      where: { email: 'k.donner@me.com' },
      update: {},
      create: {
        id: 'cm5b1vtd9000010o6psyspijj',
        email: 'k.donner@me.com',
        name: 'Keith Donner',
        password: 'hashed_password', // In production, hash the password
      },
    })

    // Create workspace if not exists
    const workspace = await prisma.workspace.upsert({
      where: { url: 'kdon22' },
      update: {},
      create: {
        name: 'Keith\'s Workspace',
        url: 'kdon22',
      },
    })

    // Create workspace member if not exists
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    })

    // Create user preferences if not exists
    await prisma.userPreferences.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        defaultHomeView: 'my-issues',
      },
    })

    console.log('Setup completed successfully')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 