import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const workspaceRouter = router({
  getMembers: protectedProcedure
    .input(
      z.object({
        workspaceUrl: z.string().min(1)
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.workspaceUrl },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return workspace.members
    }),

  getTeams: protectedProcedure
    .input(
      z.object({
        workspaceUrl: z.string().min(1)
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.workspaceUrl }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return ctx.prisma.team.findMany({
        where: {
          workspaceId: workspace.id
        }
      })
    })
}) 