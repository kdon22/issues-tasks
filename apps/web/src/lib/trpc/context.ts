import { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions)

  return {
    req,
    resHeaders,
    session,
    prisma,
  }
}

export type Context = inferAsyncReturnType<typeof createContext> 