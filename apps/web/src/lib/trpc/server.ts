import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './routers'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { type Context } from './context'

export async function createContext(): Promise<Context> {
  const session = await getSession()

  return {
    prisma,
    session,
  }
}

export const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext,
  }) 