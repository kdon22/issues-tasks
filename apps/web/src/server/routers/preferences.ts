import { router, publicProcedure } from '../trpc'
import { z } from 'zod'

export const preferencesRouter = router({
  getCurrent: publicProcedure
    .query(async ({ ctx }) => {
      const preferences = await ctx.prisma.userPreferences.findUnique({
        where: {
          userId: ctx.session?.user?.id
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

  update: publicProcedure
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
          userId: ctx.session?.user?.id
        },
        create: {
          userId: ctx.session?.user?.id!,
          ...input
        },
        update: input
      })
    })
}) 