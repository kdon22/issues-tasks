import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { prisma } from '@/lib/prisma'
import { TRPCError } from '@trpc/server'

export const preferencesRouter = router({
  // Global user preferences
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    let preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: ctx.session.user.id
      }
    })

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await prisma.userPreferences.create({
        data: {
          userId: ctx.session.user.id,
          defaultHomeView: 'my-issues',
          fontSize: 'default',
          interfaceTheme: 'system',
          usePointerCursor: false,
          displayFullNames: false
        }
      })
    }

    return preferences
  }),

  update: protectedProcedure
    .input(
      z.object({
        defaultHomeView: z.string().optional(),
        fontSize: z.string().optional(),
        interfaceTheme: z.string().optional(),
        usePointerCursor: z.boolean().optional(),
        displayFullNames: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.userPreferences.upsert({
        where: {
          userId: ctx.session.user.id
        },
        create: {
          userId: ctx.session.user.id,
          ...input
        },
        update: input
      })
    })
}) 