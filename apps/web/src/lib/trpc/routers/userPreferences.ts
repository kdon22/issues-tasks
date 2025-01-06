import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const userPreferencesRouter = router({
  get: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userPreferences.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId: input.workspaceId
          }
        }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      defaultHomeView: z.string().optional(),
      fontSize: z.string().optional(),
      displayFullNames: z.boolean().optional(),
      interfaceTheme: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, ...data } = input
      return ctx.prisma.userPreferences.upsert({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId
          }
        },
        create: {
          userId: ctx.session.user.id,
          workspaceId,
          ...data
        },
        update: data
      })
    })
}) 