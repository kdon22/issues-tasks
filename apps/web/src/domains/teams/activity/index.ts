import { prisma } from '@/infrastructure/db/prisma'
import type { User } from '@prisma/client'

export type TeamActivityType = 
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_ROLE_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'TEAM_UPDATED'
  | 'TEAM_DELETED'

interface LogTeamActivityProps {
  teamId: string
  userId: string
  type: TeamActivityType
  data?: Record<string, any>
}

export async function logTeamActivity({
  teamId,
  userId,
  type,
  data = {}
}: LogTeamActivityProps) {
  return prisma.teamActivity.create({
    data: {
      teamId,
      userId,
      type,
      data
    }
  })
}

export async function getTeamActivity(teamId: string) {
  return prisma.teamActivity.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarType: true,
          avatarIcon: true,
          avatarColor: true,
          avatarEmoji: true,
          avatarImageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
} 