import { z } from 'zod'
import { router, protectedProcedure } from '../core/trpc'
import type { AvatarData } from '@/domains/shared/types/avatar'
import { AvatarType } from '@prisma/client'

const avatarDataSchema = z.object({
  type: z.nativeEnum(AvatarType),
  name: z.string(),
  value: z.string(),
  color: z.string()
})

const inputSchema = z.object({
  entityType: z.enum(['user', 'workspace', 'team']),
  id: z.string(),
  data: avatarDataSchema
})

export const avatarRouter = router({
  get: protectedProcedure
    .input(z.object({
      entityType: z.enum(['user', 'workspace', 'team']),
      id: z.string()
    }))
    .query(async ({ ctx, input }) => {
      switch (input.entityType) {
        case 'user':
          const user = await ctx.prisma.user.findUnique({
            where: { id: input.id }
          })
          return user ? {
            type: user.avatarType,
            name: user.name,
            value: user.avatarIcon || user.avatarEmoji || user.avatarImageUrl || '',
            color: user.avatarColor || '#000000'
          } as AvatarData : null

        case 'workspace':
          const workspace = await ctx.prisma.workspace.findUnique({
            where: { id: input.id }
          })
          return workspace ? {
            type: workspace.avatarType,
            name: workspace.name,
            value: workspace.avatarIcon || workspace.avatarEmoji || workspace.avatarImageUrl || '',
            color: workspace.avatarColor || '#000000'
          } as AvatarData : null

        case 'team':
          const team = await ctx.prisma.team.findUnique({
            where: { id: input.id }
          })
          return team ? {
            type: team.avatarType,
            name: team.name,
            value: team.avatarIcon || team.avatarEmoji || team.avatarImageUrl || '',
            color: team.avatarColor || '#000000'
          } as AvatarData : null
      }
    }),

  update: protectedProcedure
    .input(inputSchema)
    .mutation(async ({ ctx, input }) => {
      const { entityType, id, data } = input
      const avatarData = {
        avatarType: data.type,
        avatarColor: data.color,
        avatarIcon: data.type === 'ICON' ? data.value : null,
        avatarEmoji: data.type === 'EMOJI' ? data.value : null,
        avatarImageUrl: data.type === 'IMAGE' ? data.value : null
      }

      switch (entityType) {
        case 'user':
          return ctx.prisma.user.update({
            where: { id },
            data: avatarData
          })

        case 'workspace':
          return ctx.prisma.workspace.update({
            where: { id },
            data: avatarData
          })

        case 'team':
          return ctx.prisma.team.update({
            where: { id },
            data: avatarData
          })
      }
    })
}) 