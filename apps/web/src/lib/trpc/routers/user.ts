import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { TRPCError } from '@trpc/server'

const preferencesSchema = z.object({
  defaultHomeView: z.enum(['active-issues', 'my-issues', 'all-issues']).optional(),
  displayFullNames: z.boolean().optional(),
  firstDayOfWeek: z.enum(['Sunday', 'Monday']).optional(),
  useEmoticons: z.boolean().optional(),
  fontSize: z.enum(['small', 'default', 'large']).optional(),
  usePointerCursor: z.boolean().optional(),
  interfaceTheme: z.enum(['light', 'dark', 'system']).optional(),
})

export const userRouter = router({
  // Profile management
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      nickname: z.string().optional(),
      icon: z.string().optional(),
      iconColor: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          name: true,
          email: true,
          icon: true,
          iconColor: true,
          nickname: true,
        },
      })
    }),

  // Preferences management
  getPreferences: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const preferences = await ctx.prisma.userPreferences.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId: input.workspaceId,
          },
        },
      })

      return preferences
    }),

  updatePreferences: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      preferences: z.object({
        defaultHomeView: z.string().optional(),
        displayFullNames: z.boolean().optional(),
        fontSize: z.string().optional(),
        usePointerCursor: z.boolean().optional(),
        interfaceTheme: z.string().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.prisma.userPreferences.upsert({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId: input.workspaceId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          workspaceId: input.workspaceId,
          ...input.preferences,
        },
        update: input.preferences,
      })

      return preferences
    }),
}) 