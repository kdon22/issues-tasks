import { middleware } from '../trpc'
import { TRPCError } from '@trpc/server'

export const errorHandler = middleware(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    console.error('TRPC Error:', error)
    throw error instanceof TRPCError 
      ? error 
      : new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
  }
}) 