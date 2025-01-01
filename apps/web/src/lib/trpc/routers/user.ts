import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const avatarDataSchema = z.object({
  type: z.enum(['initials', 'icon', 'image']),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  imageUrl: z.string().nullable(),
})

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          nickname: true,
          avatarType: true,
          avatarIcon: true,
          avatarColor: true,
          avatarImageUrl: true,
        },
      })
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      nickname: z.string().optional(),
      avatarData: z.object({
        type: z.enum(['initials', 'icon', 'image']),
        icon: z.string().nullable(),
        color: z.string().nullable(),
        imageUrl: z.string().nullable(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          nickname: input.nickname,
          avatarType: input.avatarData.type,
          avatarIcon: input.avatarData.icon,
          avatarColor: input.avatarData.color,
          avatarImageUrl: input.avatarData.imageUrl,
        },
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
            firstDayOfWeek: 'Monday',
            useEmoticons: true
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