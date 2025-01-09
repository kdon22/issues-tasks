import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { avatarSchema } from '@/lib/validations/avatar'
import { toAvatarFields } from '@/lib/types/avatar'

export const userRouter = router({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      icon: z.string().nullable(),
      color: z.string().nullable(),
      emoji: z.string().nullable(),
      imageUrl: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: toAvatarFields(input)
      })
    })
}) 