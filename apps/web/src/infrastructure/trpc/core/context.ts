import { getServerSession } from 'next-auth'
import { prisma } from '@/infrastructure/db/prisma'
import { authOptions } from '@/infrastructure/auth/config'

interface CreateContextOptions {
  req: Request
  resHeaders: Headers
}

export async function createContext({ req, resHeaders }: CreateContextOptions) {
  const session = await getServerSession(authOptions)

  return {
    session,
    prisma,
    req,
    resHeaders
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

export interface ProtectedContext extends Context {
  user: NonNullable<Context['session']>['user']
} 