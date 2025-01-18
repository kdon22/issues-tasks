import { prisma } from '@/infrastructure/db/prisma'
import { TRPCError } from '@trpc/server'
import { type AvatarInput } from '../validations/avatar'
import type { AvatarData } from '../components/Avatar/types'
import { toAvatarData } from '../components/Avatar/utils'
import type { AvatarType } from '@prisma/client'

type EntityType = 'user' | 'team' | 'workspace' | 'project' | 'issueType' | 'issueTemplate' | 'view'

// Helper function to ensure entity has required avatar fields
function ensureAvatarFields(entity: any) {
  return {
    ...entity,
    name: entity.name || entity.displayName || 'Unnamed' // Fallback for null names
  }
}

async function updateEntity(type: EntityType, id: string, data: {
  avatarType?: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
}) {
  switch (type) {
    case 'user':
      return prisma.user.update({ where: { id }, data })
    case 'team':
      return prisma.team.update({ where: { id }, data })
    case 'workspace':
      return prisma.workspace.update({ where: { id }, data })
    case 'project':
      // return prisma.project.update({ where: { id }, data })
    case 'issueType':
      // return prisma.issueType.update({ where: { id }, data })
    case 'issueTemplate':
      // return prisma.issueTemplate.update({ where: { id }, data })
    case 'view':
      // return prisma.view.update({ where: { id }, data })
    default:
      throw new Error(`Invalid entity type: ${type}`)
  }
}

export const avatarService = {
  async get(type: EntityType, id: string): Promise<AvatarData> {
    let entity

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
      case 'project':
        // entity = await prisma.project.findUnique({ where: { id } })
        break
      case 'issueType':
        // entity = await prisma.issueType.findUnique({ where: { id } })
        break
      case 'issueTemplate':
        // entity = await prisma.issueTemplate.findUnique({ where: { id } })
        break
      case 'view':
        // entity = await prisma.view.findUnique({ where: { id } })
        break
      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid entity type'
        })
    }

    if (!entity) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `${type} not found`
      })
    }

    return toAvatarData(ensureAvatarFields(entity))
  },

  async update(type: EntityType, id: string, data: AvatarInput): Promise<AvatarData> {
    const updateData = {
      avatarType: data.type,
      avatarIcon: data.type === 'ICON' && data.icon ? data.icon : null,
      avatarColor: (data.type === 'INITIALS' || data.type === 'ICON') && 'color' in data ? data.color : null,
      avatarEmoji: data.type === 'EMOJI' && data.emoji ? data.emoji : null,
      avatarImageUrl: data.type === 'IMAGE' && data.imageUrl ? data.imageUrl : null
    } as const

    const entity = await updateEntity(type, id, updateData)
    return toAvatarData(ensureAvatarFields(entity))
  }
} 