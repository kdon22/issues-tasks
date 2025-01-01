import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { hash, compare } from 'bcryptjs'
import { cookies } from 'next/headers'

export const authRouter = router({
  signup: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      workspace: z.object({
        name: z.string(),
        url: z.string(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hash(input.password, 12)

      try {
        const result = await ctx.prisma.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: {
              name: input.name,
              email: input.email,
              password: hashedPassword,
            },
          })

          // Create workspace
          const workspace = await tx.workspace.create({
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

          // Create preferences
          await tx.userPreferences.create({
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
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during signup',
        })
      }
    }),

  logout: protectedProcedure
    .mutation(async () => {
      cookies().delete('session')
      return {
        redirectTo: '/login',
      }
    }),

  refresh: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Session expired',
        })
      }

      // Extend session
      cookies().set('session', JSON.stringify(ctx.session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })

      return { success: true }
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
      remember: z.boolean().optional().default(false),
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

        // Get default workspace
        const defaultWorkspace = user.workspaces[0]?.workspace
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

        // Set cookie with expiration based on remember me
        const expiresIn = input.remember 
          ? 30 * 24 * 60 * 60 * 1000  // 30 days
          : 24 * 60 * 60 * 1000       // 1 day

        cookies().set('session', JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + expiresIn),
        })

        return {
          redirectTo: `/${defaultWorkspace.url}/my-issues`,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during login',
        })
      }
    }),

  getWorkspaces: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        }
      })
    }),

  switchWorkspace: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          url: input.workspaceUrl,
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      // Update session with new workspace
      const session = {
        ...ctx.session,
        workspace: {
          id: workspace.id,
          url: workspace.url,
        }
      }

      // Update session cookie
      cookies().set('session', JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

      return {
        redirectTo: `/${workspace.url}/my-issues`
      }
    }),
}) 