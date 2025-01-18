import { prisma } from '@/infrastructure/db/prisma'
import type { TeamRole } from '@prisma/client'

export async function canManageTeam(userId: string, teamId: string) {
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  })

  return member?.role === 'ADMIN'
}

export async function canManageMembers(userId: string, teamId: string) {
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  })

  return member?.role === 'ADMIN'
}

export async function getMemberRole(userId: string, teamId: string): Promise<TeamRole | null> {
  const member = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  })

  return member?.role ?? null
} 