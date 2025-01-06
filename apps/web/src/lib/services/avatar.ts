import { prisma } from '@/lib/prisma'
import { type AvatarData } from '@/lib/types/avatar'

export const avatarService = {
  async get(type: 'user' | 'team' | 'workspace', id: string): Promise<AvatarData> {
    let entity;

    switch (type) {
      case 'user':
        entity = await prisma.user.findUnique({
          where: { id },
          select: {
            name: true,
            avatarType: true,
            avatarIcon: true,
            avatarColor: true,
            avatarEmoji: true,
            avatarImageUrl: true
          }
        })
        break;

      case 'team':
        entity = await prisma.team.findUnique({
          where: { id },
          select: {
            name: true,
            avatarType: true,
            avatarIcon: true,
            avatarColor: true,
            avatarEmoji: true,
            avatarImageUrl: true
          }
        })
        break;

      case 'workspace':
        entity = await prisma.workspace.findUnique({
          where: { id },
          select: {
            name: true,
            avatarType: true,
            avatarIcon: true,
            avatarColor: true,
            avatarEmoji: true,
            avatarImageUrl: true
          }
        })
        break;

      default:
        throw new Error('Invalid entity type')
    }

    if (!entity) throw new Error('Entity not found')

    return {
      type: entity.avatarType,
      icon: entity.avatarIcon || undefined,
      color: entity.avatarColor || undefined,
      emoji: entity.avatarEmoji || undefined,
      imageUrl: entity.avatarImageUrl || undefined,
      name: entity.name || ''
    }
  }
} 