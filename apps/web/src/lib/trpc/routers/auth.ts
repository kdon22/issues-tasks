import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import type { Session } from '@/lib/types/session'
import { TRPCError } from '@trpc/server'
import { hash } from 'bcryptjs'

export const authRouter = router({
  getSession: publicProcedure
    .query(async ({ ctx }): Promise<Session | null> => {
      return ctx.session
    }),

  refresh: protectedProcedure
    .mutation(async ({ ctx }): Promise<Session> => {
      // Implement your refresh logic here
      return ctx.session as Session
    }),

  signup: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
      workspaceName: z.string(),
      workspaceUrl: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email }
      })
      
      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists'
        })
      }

      const hashedPassword = await hash(input.password, 12)
      
      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          workspaces: {
            create: {
              role: 'OWNER',
              workspace: {
                create: {
                  name: input.workspaceName,
                  url: input.workspaceUrl
                }
              }
            }
          }
        }
      })
    })
}) 