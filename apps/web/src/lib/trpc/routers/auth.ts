import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { cookies } from 'next/headers'
import { hash } from 'bcryptjs'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { email: input.email },
          include: {
            workspaces: {
              include: { workspace: true },
              orderBy: { updatedAt: 'desc' },
              take: 1,
            },
          },
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No user found with this email',
          })
        }

        const isValid = await compare(input.password, user.password)
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          })
        }

        // Get default workspace (first one if no last accessed)
        let defaultWorkspace = user.workspaces[0]?.workspace
        if (!defaultWorkspace) {
          // Fallback: get any workspace the user is a member of
          defaultWorkspace = await ctx.prisma.workspace.findFirst({
            where: {
              members: {
                some: { userId: user.id }
              }
            }
          })
        }

        if (!defaultWorkspace) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No workspace found',
          })
        }

        // Create session
        const session = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          workspace: {
            id: defaultWorkspace.id,
            url: defaultWorkspace.url,
          },
        }

        // Set session cookie
        cookies().set('session', JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })

        return {
          redirectTo: `/${defaultWorkspace.url}/my-issues`,
        }
      } catch (error) {
        console.error('Login error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        })
      }
    }),

  // Add workspace switching
  switchWorkspace: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const workspace = await prisma.workspace.findUnique({
          where: { url: input.workspaceUrl },
          include: {
            members: {
              where: { userId: ctx.session.user.id },
            },
          },
        })

        if (!workspace || !workspace.members.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Workspace not found or access denied',
          })
        }

        // Update session with new workspace
        const sessionData = {
          ...ctx.session,
          workspace: {
            id: workspace.id,
            url: workspace.url,
          },
        }

        // Update session cookie
        cookies().set('session', JSON.stringify(sessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        })

        // Update last accessed timestamp
        await prisma.workspaceMember.update({
          where: {
            workspaceId_userId: {
              workspaceId: workspace.id,
              userId: ctx.session.user.id,
            },
          },
          data: { updatedAt: new Date() },
        })

        return {
          success: true,
          redirectTo: `/${workspace.url}/my-issues`,
        }
      } catch (error) {
        console.error('Workspace switch error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to switch workspace',
        })
      }
    }),

  // Get available workspaces
  getWorkspaces: protectedProcedure
    .query(async ({ ctx }) => {
      const workspaces = await prisma.workspace.findMany({
        where: {
          members: {
            some: { userId: ctx.session.user.id },
          },
        },
        orderBy: [
          { members: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
      })
      return workspaces
    }),

  signup: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      workspace: z.object({
        name: z.string().min(1),
        url: z.string().min(1),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if email is already taken
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        })

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists',
          })
        }

        // Check if workspace URL is available
        const existingWorkspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.workspace.url },
        })

        if (existingWorkspace) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Workspace URL is already taken',
          })
        }

        // Create user and workspace in a transaction
        const result = await ctx.prisma.$transaction(async (prisma) => {
          // Create user
          const user = await prisma.user.create({
            data: {
              name: input.name,
              email: input.email,
              password: await hash(input.password, 12),
            },
          })

          // Create workspace
          const workspace = await prisma.workspace.create({
            data: {
              name: input.workspace.name,
              url: input.workspace.url,
              members: {
                create: {
                  userId: user.id,
                  role: 'OWNER',
                },
              },
            },
          })

          // Create default preferences
          await prisma.userPreferences.create({
            data: {
              userId: user.id,
              workspaceId: workspace.id,
              defaultHomeView: 'my-issues',
            },
          })

          return { user, workspace }
        })

        // Create session
        const session = {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
          workspace: {
            id: result.workspace.id,
            url: result.workspace.url,
          },
        }

        // Set session cookie
        cookies().set('session', JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })

        return {
          redirectTo: `/${result.workspace.url}/my-issues`,
        }
      } catch (error) {
        console.error('Signup error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        })
      }
    }),
}) 