import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const teamRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      identifier: z.string(),
      workspaceId: z.string(),
      avatar: z.object({
        type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        emoji: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspaceId: input.workspaceId,
          avatarType: input.avatar.type,
          avatarIcon: input.avatar.icon,
          avatarColor: input.avatar.color,
          avatarEmoji: input.avatar.emoji,
          avatarImageUrl: input.avatar.imageUrl,
        }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      id: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable().optional(),
      avatarColor: z.string().nullable().optional(),
      avatarEmoji: z.string().nullable().optional(),
      avatarImageUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.update({
        where: { id: input.id },
        data: {
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl,
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
    })
}) 