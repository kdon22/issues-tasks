import type { Session } from '@/lib/types/session'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await getServerSession(authOptions) as Session | null

  return {
    req,
    prisma,
    session,
    user: session?.user
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> 