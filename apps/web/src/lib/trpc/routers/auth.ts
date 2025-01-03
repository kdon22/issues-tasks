import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { comparePasswords } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authRouter = router({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
        include: {
          workspaces: {
            include: {
              workspace: true,
            },
            take: 1,
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const isValid = await comparePasswords(input.password, user.password)
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })
      }

      if (!user.workspaces[0]?.workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No workspace found',
        })
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        workspace: user.workspaces[0].workspace,
      }
    }),
}) 