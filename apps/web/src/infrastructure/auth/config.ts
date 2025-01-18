import { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/infrastructure/db/prisma'
import { compare } from 'bcryptjs'
import type { User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

export const authOptions: AuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          console.log('Auth attempt started')
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            throw new Error('Email and password are required')
          }

          console.log('Attempting to find user:', credentials.email)
          // Test database connection first
          try {
            await prisma.$connect()
            console.log('Database connected successfully')
          } catch (dbError) {
            console.error('Database connection error:', dbError)
            throw new Error('Database connection failed')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() }, // Normalize email
            include: {
              workspaces: {
                take: 1,
                orderBy: { lastAccessedAt: 'desc' },
                select: { workspace: { select: { url: true } } }
              }
            }
          })

          console.log('Database query completed')
          console.log('User found:', user ? 'Yes' : 'No')
          
          if (!user) {
            throw new Error('Invalid email or password')
          }

          if (!user.password) {
            console.error('User has no password hash stored')
            throw new Error('Invalid account configuration')
          }

          console.log('Checking password...')
          const isValidPassword = await compare(credentials.password, user.password)
          console.log('Password valid:', isValidPassword)

          if (!isValidPassword) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            displayName: user.displayName,
            avatarType: user.avatarType,
            avatarIcon: user.avatarIcon,
            avatarColor: user.avatarColor,
            avatarEmoji: user.avatarEmoji,
            avatarImageUrl: user.avatarImageUrl,
            defaultWorkspace: user.workspaces[0]?.workspace.url ?? null
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: JWT, user?: User }) => {
      if (user) {
        token.id = user.id
        token.defaultWorkspace = user.defaultWorkspace
      }
      return token
    },
    session: ({ session, token }: { session: any, token: JWT }) => {
      if (token) {
        session.user.id = token.id
        session.user.defaultWorkspace = token.defaultWorkspace
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
}

export { authOptions as authConfig } 