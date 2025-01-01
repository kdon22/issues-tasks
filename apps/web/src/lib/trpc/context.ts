import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { prisma } from '../prisma'
import { cookies } from 'next/headers'

interface Session {
  user: {
    id: string
    email: string
    name: string
  }
  workspace: {
    id: string
    url: string
  }
}

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Get session from cookies
  const sessionCookie = cookies().get('session')
  let session: Session | null = null

  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      session = null
    }
  }

  return {
    prisma,
    session,
    req: opts?.req,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> 