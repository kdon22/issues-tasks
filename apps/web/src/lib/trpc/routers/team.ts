import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { type AvatarData } from '@/lib/types/avatar'

export const teamRouter = router({
  create: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string(),
      name: z.string(),
      identifier: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable(),
      avatarColor: z.string().nullable(),
      avatarEmoji: z.string().nullable(),
      avatarImageUrl: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.workspaceUrl }
      })
      
      if (!workspace) throw new Error('Workspace not found')

      return ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspaceId: workspace.id,
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'OWNER'
            }
          }
        }
      })
    }),

  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.team.findMany({
        where: {
          workspaceId: input.workspaceId,
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        },
        include: {
          _count: {
            select: { members: true }
          }
        }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable(),
      avatarColor: z.string().nullable(),
      avatarEmoji: z.string().nullable(),
      avatarImageUrl: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, ...avatarData } = input
      
      return ctx.prisma.team.update({
        where: { id: teamId },
        data: avatarData
      })
    })
}) 