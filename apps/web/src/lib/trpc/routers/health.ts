import { router, publicProcedure } from '../trpc'
import { TRPC_VERSION } from '../config'

export const healthRouter = router({
  check: publicProcedure.query(() => ({
    status: 'ok',
    version: TRPC_VERSION,
    timestamp: new Date().toISOString()
  }))
}) 