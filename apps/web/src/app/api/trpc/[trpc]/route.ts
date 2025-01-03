import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/router'
import { createContext } from '@/lib/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ 
      req,
      resHeaders: new Headers(),
    }),
  })

export { handler as GET, handler as POST } 