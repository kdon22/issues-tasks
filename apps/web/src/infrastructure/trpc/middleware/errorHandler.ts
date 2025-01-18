import { TRPCError } from '@trpc/server'
import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

export const errorHandler = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    console.error('TRPC Error:', error)
    throw error instanceof TRPCError 
      ? error 
      : new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        })
  }
}) 