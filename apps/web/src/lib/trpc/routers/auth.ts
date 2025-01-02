import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { hash, compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { slugify } from '@/lib/utils'
import type { Session } from '@/lib/types/session'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }): Promise<Session> => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        include: {
          workspaces: {
            include: {
              workspace: true
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1
          }
        }
      })

      if (!user || !user.workspaces[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User or workspace not found',
        })
      }

      const valid = await compare(input.password, user.password)
      if (!valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })
      }

      const session: Session = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        workspace: {
          id: user.workspaces[0].workspaceId,
          url: user.workspaces[0].workspace.url,
        }
      }

      // Set cookie
      cookies().set('session', JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

      return session
    }),
}) 