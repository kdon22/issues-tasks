import { z } from 'zod'
import { router, protectedProcedure } from '../core/trpc'

const notificationSettingsSchema = z.object({
  email: z.object({
    marketing: z.boolean(),
    updates: z.boolean(),
    teamActivity: z.boolean()
  }),
  web: z.object({
    teamActivity: z.boolean(),
    mentions: z.boolean()
  })
})

export const userRouter = router({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = input.id === 'me' ? ctx.session?.user?.id : input.id
      if (!userId) throw new Error('User not found')

      console.log('User router get:', { userId })
      
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true
        }
      })

      console.log('User router result:', user)
      return user
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      preferences: z.object({
        defaultHomeView: z.string(),
        fontSize: z.string(),
        interfaceTheme: z.string(),
        displayFullNames: z.boolean(),
        workspaceId: z.string()
      }).partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, preferences } = input
      
      // First check if preferences exist
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        include: { preferences: true }
      })

      if (!user?.preferences) {
        // Create with defaults if doesn't exist
        return ctx.prisma.user.update({
          where: { id },
          data: {
            preferences: {
              create: {
                defaultHomeView: preferences.defaultHomeView || "my-issues",
                fontSize: "default",
                interfaceTheme: "system",
                usePointerCursor: false,
                displayFullNames: false,
                workspaceId: preferences.workspaceId || '',
                id: undefined // Let Prisma handle the ID
              }
            }
          },
          include: { preferences: true }
        })
      }

      // Update if exists
      return ctx.prisma.user.update({
        where: { id },
        data: {
          preferences: {
            update: preferences
          }
        },
        include: { preferences: true }
      })
    }),

  getNotificationSettings: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { notificationSettings: true }
      })
    }),

  updateNotificationSettings: protectedProcedure
    .input(notificationSettingsSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { notificationSettings: input }
      })
    }),

  getPreferences: protectedProcedure
    .query(({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { preferences: true }
      })
    }),

  updatePassword: protectedProcedure
    .input(z.object({
      userId: z.string(),
      currentPassword: z.string(),
      newPassword: z.string()
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { password: input.newPassword } // Note: Add password hashing
      })
    })
}) 