import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const teamMemberRouter = router({
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.findMany({
        where: { teamId: input.teamId },
        include: { user: true }
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
            teamId: input.teamId,
            userId: input.userId
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
            teamId: input.teamId,
            userId: input.userId
          }
        }
      })
    }),

  add: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string(),
      role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST'])
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: input.userId,
          role: input.role
        }
      })
    })
}) 