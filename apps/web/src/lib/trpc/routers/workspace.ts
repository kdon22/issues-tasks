import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { slugify } from '@/lib/utils'

export const workspaceRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      url: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate URL-friendly slug if not provided
        const url = input.url || slugify(input.name)

        // Check if URL is already taken
        const existing = await ctx.prisma.workspace.findUnique({
          where: { url }
        })

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This workspace URL is already taken'
          })
        }

        // Create workspace and add creator as owner
        const workspace = await ctx.prisma.workspace.create({
          data: {
            name: input.name,
            url,
            members: {
              create: {
                userId: ctx.session.user.id,
                role: 'OWNER'
              }
            }
          }
        })

        // Create default preferences for user in this workspace
        await ctx.prisma.userPreferences.create({
          data: {
            userId: ctx.session.user.id,
            workspaceId: workspace.id,
            defaultHomeView: 'my-issues'
          }
        })

        return workspace
      } catch (error) {
        console.error('Workspace creation error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create workspace'
        })
      }
    }),

  // Get current workspace by URL
  getByUrl: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.url },
        include: {
          members: {
            where: { userId: ctx.session.user.id }
          }
        }
      })

      if (!workspace || !workspace.members.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or access denied',
        })
      }

      return workspace
    }),

  // Get user's workspaces
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.workspace.findMany({
        where: {
          members: {
            some: { userId: ctx.session.user.id }
          }
        }
      })
    }),

  updateWorkspace: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission
      const member = await ctx.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: ctx.session.workspace.id,
            userId: ctx.session.user.id,
          },
        },
      })

      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this workspace',
        })
      }

      const workspace = await ctx.prisma.workspace.update({
        where: { id: ctx.session.workspace.id },
        data: { name: input.name },
      })

      return workspace
    }),

  // Generate invite link
  createInvite: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      expiresIn: z.number().optional(), // hours
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to invite
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: input.workspaceId,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        },
      })

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create invites',
        })
      }

      // Create invite link
      const invite = await ctx.prisma.invite.create({
        data: {
          code: `${Math.random().toString(36).substr(2, 9)}`,
          workspace: { connect: { id: input.workspaceId } },
          createdBy: { connect: { id: ctx.session.user.id } },
          expiresAt: input.expiresIn 
            ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000)
            : null,
        },
      })

      return invite
    }),

  // Join workspace with invite code
  join: protectedProcedure
    .input(z.object({
      inviteCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.prisma.invite.findUnique({
        where: { code: input.inviteCode },
        include: { workspace: true },
      })

      if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invite code',
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: invite.workspaceId,
          userId: ctx.session.user.id,
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a member of this workspace',
        })
      }

      // Add user to workspace
      await ctx.prisma.workspaceMember.create({
        data: {
          workspace: { connect: { id: invite.workspaceId } },
          user: { connect: { id: ctx.session.user.id } },
          role: 'MEMBER',
        },
      })

      // Create default preferences
      await ctx.prisma.userPreferences.create({
        data: {
          user: { connect: { id: ctx.session.user.id } },
          workspace: { connect: { id: invite.workspaceId } },
          defaultHomeView: 'my-issues',
        },
      })

      return invite.workspace
    }),

  updateUrl: protectedProcedure
    .input(z.object({
      url: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: {
          workspaceId: ctx.session.workspace.id,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] }
        },
      })

      if (!member) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this workspace',
        })
      }

      // Check if URL is already taken
      const existing = await ctx.prisma.workspace.findUnique({
        where: { url: input.url },
      })

      if (existing && existing.id !== ctx.session.workspace.id) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This workspace URL is already taken',
        })
      }

      // Update workspace URL
      const workspace = await ctx.prisma.workspace.update({
        where: { id: ctx.session.workspace.id },
        data: { url: input.url },
      })

      return workspace
    }),

  // Add getCurrent procedure
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        orderBy: {
          members: {
            _count: 'desc',
          },
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No workspace found',
        })
      }

      return workspace
    }),
}) 