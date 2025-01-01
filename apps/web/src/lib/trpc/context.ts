import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { prisma } from '@/lib/prisma'

export async function createContext({ req, res }: CreateNextContextOptions) {
  return {
    req,
    res,
    prisma,
    session: null, // You'll populate this from your session management
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> 