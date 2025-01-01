import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in',
      })
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    })
  })
)

export const workspaceProcedure = protectedProcedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.session?.workspace) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No workspace selected',
      })
    }
    return next({
      ctx: {
        ...ctx,
        workspace: ctx.session.workspace,
      },
    })
  })
) 