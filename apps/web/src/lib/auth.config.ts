import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authConfig: AuthOptions = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        
        // Get user's last accessed workspace
        const lastWorkspace = await prisma.workspaceMember.findFirst({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { lastAccessedAt: 'desc' }
        })

        if (lastWorkspace) {
          token.workspace = lastWorkspace.workspace
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
        workspace: token.workspace
      }
    },
    async redirect({ url, baseUrl }) {
      // If url starts with base url, allow it
      if (url.startsWith(baseUrl)) return url
      
      // Allow relative urls
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // Default to workspace selection
      return '/api/workspace'
    }
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return user
      }
    })
  ]
} 