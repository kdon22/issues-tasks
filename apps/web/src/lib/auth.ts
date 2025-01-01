import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { type Session } from './trpc/context'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            workspaces: {
              include: {
                workspace: true
              },
              take: 1 // Get first workspace for initial redirect
            }
          }
        })

        if (!user) {
          return null
        }

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        // Get default workspace
        const defaultWorkspace = user.workspaces[0]?.workspace
        if (!defaultWorkspace) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspace: {
            id: defaultWorkspace.id,
            url: defaultWorkspace.url
          }
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.workspace = user.workspace
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name
        }
        session.workspace = token.workspace
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Type declarations
declare module 'next-auth' {
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
  interface User {
    id: string
    email: string
    name: string
    workspace: {
      id: string
      url: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    workspace: {
      id: string
      url: string
    }
  }
}

export async function getSession(): Promise<Session | null> {
  const cookie = cookies().get('session')
  if (!cookie?.value) return null

  try {
    const session = JSON.parse(cookie.value) as Session
    return session
  } catch {
    return null
  }
} 