import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import type { AvatarData } from '@/lib/types/avatar'

export const teamMemberRouter = router({
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.findMany({
        where: { teamId: input.teamId },
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
        }
      })
    }),

  updateRole: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string(),
      role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'])
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.update({
        where: {
          userId_teamId: {
            userId: input.userId,
            teamId: input.teamId
          }
        },
        data: { role: input.role }
      })
    }),

  remove: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.delete({
        where: {
          userId_teamId: {
            userId: input.userId,
            teamId: input.teamId
          }
        }
      })
    }),

  add: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      email: z.string().email(),
      role: z.enum(['MEMBER', 'ADMIN', 'GUEST'])
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email }
      })
      if (!user) throw new Error('User not found')

      return ctx.prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: user.id,
          role: input.role
        }
      })
    })
}) 