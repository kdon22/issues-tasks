import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const workspaceRouter = router({
  getCurrent: publicProcedure
    .query(async ({ ctx }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          members: {
            some: {
              userId: ctx.session?.user?.id
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No workspace found'
        })
      }

      return workspace
    }),

  update: publicProcedure
    .input(z.object({
      name: z.string().optional(),
      url: z.string().optional(),
      icon: z.string().optional(),
      fiscalYearStart: z.string().optional(),
      region: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.update({
        where: {
          id: ctx.session?.workspace?.id
        },
        data: input
      })

      return workspace
    })
}) 