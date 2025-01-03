import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupWorkspace() {
  const user = await prisma.user.findFirst({
    where: {
      email: 'test@example.com',
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      url: 'test-workspace',
    },
  })

  // Update this part to use create instead of upsert
  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'OWNER',
    },
  })

  console.log('Workspace setup complete')
}

setupWorkspace()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 