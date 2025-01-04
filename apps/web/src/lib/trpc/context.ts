import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(req, res, authOptions)

  return {
    prisma,
    session,
    user: session?.user
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> 