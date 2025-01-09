import type { DefaultSession } from 'next-auth'
import type { Workspace } from '@prisma/client'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name?: string | null
    }
    workspace?: Workspace | null
  }

  interface User {
    id: string
    email: string
    name?: string | null
  }
} 