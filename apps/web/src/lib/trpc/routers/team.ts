import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.team.findMany({
        where: {
          workspaceId: input.workspaceId,
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        }
      })
    }),
}) 