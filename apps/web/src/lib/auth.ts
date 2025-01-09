import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          defaultWorkspace: null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        console.log('JWT Callback - Processing user:', user.id)
        
        // Get user's last accessed workspace
        const lastWorkspace = await prisma.workspaceMember.findFirst({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { lastAccessedAt: 'desc' }
        })

        console.log('JWT Callback - Found workspace:', lastWorkspace?.workspace?.url)

        if (lastWorkspace) {
          token.workspace = lastWorkspace.workspace
          console.log('JWT Callback - Setting workspace in token:', lastWorkspace.workspace.url)
        }
      }
      console.log('JWT Callback - Final token workspace:', token?.workspace?.url)
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', token)
      if (token) {
        session.user.id = token.id as string
        session.workspace = token.workspace as any
        console.log('Session Callback - Final Session:', session)
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login'
  },
  session: {
    strategy: 'jwt'
  }
} 