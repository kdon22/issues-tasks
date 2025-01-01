import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamMemberRouter = router({
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.prisma.teamMember.findMany({
        where: {
          teamId: input.teamId,
        },
        include: {
          user: true,
        },
      })
      return members
    }),
}) 