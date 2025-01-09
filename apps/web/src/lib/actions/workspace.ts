'use server'

import { prisma } from '@/lib/prisma'

export async function getWorkspace(url: string) {
  return prisma.workspace.findUnique({
    where: { url }
  })
} 