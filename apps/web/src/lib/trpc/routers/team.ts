import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { toAvatarFields } from '@/lib/types/avatar'
import { avatarSchema } from '@/lib/validations/avatar'

export const teamRouter = router({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.team.findFirst({
        where: {
          id: input.id,
          workspace: {
            members: {
              some: {
                userId: ctx.session.user.id
              }
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
          workspace: {
            members: {
              some: {
                userId: ctx.session.user.id
              }
            }
          }
        },
        include: {
          _count: {
            select: { members: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      name: z.string(),
      type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      icon: z.string().nullable(),
      color: z.string().nullable(),
      emoji: z.string().nullable(),
      imageUrl: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, ...avatarData } = input

      const team = await ctx.prisma.team.findFirst({
        where: {
          id: teamId,
          workspace: {
            members: {
              some: {
                userId: ctx.session.user.id,
                role: 'ADMIN'
              }
            }
          }
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this team'
        })
      }

      return ctx.prisma.team.update({
        where: { id: teamId },
        data: toAvatarFields(avatarData)
      })
    }),

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

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspaceId: workspace.id,
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl
        }
      })
    })
}) 