import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/infrastructure/trpc/routers/router'
import { createContext } from '@/infrastructure/trpc/core/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createContext({ 
      req,
      resHeaders: new Headers()
    })
  })

export { handler as GET, handler as POST } 