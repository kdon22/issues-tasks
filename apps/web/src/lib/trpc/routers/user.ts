import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const userRouter = router({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      })
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      nickname: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          nickname: input.nickname || null,
        }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      type: z.enum(['initials', 'icon', 'image']),
      icon: z.string().nullable().optional(),
      color: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          avatarType: input.type,
          avatarIcon: input.icon,
          avatarColor: input.color,
          avatarImageUrl: input.imageUrl,
        }
      })
    }),

  getPreferences: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const prefs = await ctx.prisma.userPreferences.findUnique({
        where: {
          userId_workspaceId: {
            userId: ctx.session.user.id,
            workspaceId: input.workspaceId
          }
        }
      })

      // If no preferences exist, create default ones
      if (!prefs) {
        return ctx.prisma.userPreferences.create({
          data: {
            userId: ctx.session.user.id,
            workspaceId: input.workspaceId,
            defaultHomeView: 'active-issues',
            fontSize: 'default',
            usePointerCursor: false,
            displayFullNames: false,
            interfaceTheme: 'system',
          }
        })
      }

      return prefs
    }),

  updatePreferences: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      defaultHomeView: z.string().optional(),
      fontSize: z.string().optional(),
      usePointerCursor: z.boolean().optional(),
      displayFullNames: z.boolean().optional(),
      interfaceTheme: z.string().optional(),
      firstDayOfWeek: z.string().optional(),
      useEmoticons: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, ...preferences } = input

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
          ...preferences
        },
        update: preferences
      })
    })
}) 