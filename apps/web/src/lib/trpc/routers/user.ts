import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

// Define a schema for avatar data
const avatarDataSchema = z.object({
  type: z.enum(['initials', 'icon', 'image']).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarType: true,
          avatarIcon: true,
          avatarColor: true,
          avatarImageUrl: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return user
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      avatar: avatarDataSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify email uniqueness if changing email
      if (input.email) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { 
            email: input.email,
            NOT: { id: ctx.session.user.id }
          },
        })

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          })
        }
      }

      // Update user profile
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          email: input.email,
          avatarType: input.avatar?.type,
          avatarIcon: input.avatar?.icon,
          avatarColor: input.avatar?.color,
          avatarImageUrl: input.avatar?.imageUrl,
        },
      })

      return updatedUser
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