import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'
import type { Session } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/infrastructure/auth/config'

// Extend Context type to include user for protected routes
interface ProtectedContext extends Context {
  user: Session['user']
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user }
    }
  })
})

export const createTRPCContext = async (req: NextRequest) => {
  const session = await getServerSession(authOptions)
  return {
    prisma: new PrismaClient(),
    session
  }
} 