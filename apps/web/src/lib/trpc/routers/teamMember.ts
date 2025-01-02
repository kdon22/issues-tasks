import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamMemberRouter = router({
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.teamMember.findMany({
        where: {
          teamId: input.teamId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarType: true,
              avatarIcon: true,
              avatarColor: true,
              avatarImageUrl: true
            }
          }
        }
      })
    }),
}) 