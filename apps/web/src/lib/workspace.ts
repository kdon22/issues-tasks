import { prisma } from './prisma'

export async function getWorkspace(url: string) {
  return prisma.workspace.findUnique({
    where: { url }
  })
} 