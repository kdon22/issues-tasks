import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const preferencesRouter = router({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session.workspace) {
        throw new TRPCError({ 
          code: 'PRECONDITION_FAILED',
          message: 'No workspace selected' 
        })
      }

      const preferences = await ctx.prisma.userPreferences.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId: ctx.session.workspace.id
          }
        }
      })

      return preferences || {
        homeView: 'my-issues',
        fontSize: 'default',
        usePointerCursor: false,
        displayFullNames: false,
        interfaceTheme: 'system'
      }
    }),

  update: protectedProcedure
    .input(z.object({
      homeView: z.string().optional(),
      fontSize: z.string().optional(),
      usePointerCursor: z.boolean().optional(),
      displayFullNames: z.boolean().optional(),
      interfaceTheme: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userPreferences.upsert({
        where: {
          userId_workspaceId: {
            userId: ctx.session?.user?.id!,
            workspaceId: ctx.session?.workspace?.id!
          }
        },
        create: {
          userId: ctx.session?.user?.id!,
          workspaceId: ctx.session?.workspace?.id!,
          ...input
        },
        update: input
      })
    })
}) 