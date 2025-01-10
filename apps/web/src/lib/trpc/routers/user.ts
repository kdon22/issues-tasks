import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { userProfileUpdateSchema, avatarUpdateSchema } from '@/lib/validations/user'
import { toAvatarFields } from '@/lib/types/avatar'

export const userRouter = router({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      })
    }),

  updateAvatar: protectedProcedure
    .input(avatarUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: toAvatarFields(input)
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
          ...toAvatarFields(input)
        }
      })
    })
}) 