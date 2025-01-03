import { prisma } from '@/lib/db'
import type { AvatarData } from '@/types/avatar'

export const avatarService = {
  async get(type: 'user' | 'team' | 'workspace', id: string): Promise<AvatarData> {
    let entity;
    
    switch (type) {
      case 'user':
        entity = await prisma.user.findUnique({ where: { id } })
        break
      case 'team':
        entity = await prisma.team.findUnique({ where: { id } })
        break
      case 'workspace':
        entity = await prisma.workspace.findUnique({ where: { id } })
        break
    }

    return {
      type: entity?.avatarType || 'INITIALS',
      name: entity?.name || '',
      icon: entity?.avatarIcon || undefined,
      color: entity?.avatarColor || undefined,
      emoji: entity?.avatarEmoji || undefined,
      imageUrl: entity?.avatarImageUrl || undefined
    }
  }
} 