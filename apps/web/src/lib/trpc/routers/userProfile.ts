import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { userProfileUpdateSchema } from '@/lib/validations/user'

export const userRouter = router({
  getCurrent: protectedProcedure
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
          avatarEmoji: true,
          avatarImageUrl: true
        }
      })
    }),

  updateProfile: protectedProcedure
    .input(userProfileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          nickname: input.nickname,
          avatarType: input.type,
          avatarIcon: input.icon,
          avatarColor: input.color,
          avatarEmoji: input.emoji,
          avatarImageUrl: input.imageUrl
        }
      })
    })
}) 