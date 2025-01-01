import { middleware } from '../trpc'
import { TRPCError } from '@trpc/server'

export const errorHandler = middleware(async ({ path, type, next }) => {
  try {
    return await next()
  } catch (error) {
    // Log error with path and type information
    console.error(`TRPC Error in ${path} (${type}):`, error)

    if (error instanceof TRPCError) throw error
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      cause: error
    })
  }
}) 