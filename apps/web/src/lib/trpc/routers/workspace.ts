import { router, protectedProcedure, workspaceProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { slugify, stringToColor } from '@/lib/utils'
import { cookies } from 'next/headers'
import { type Workspace, type WorkspaceMember } from '@/types/workspace'

export const workspaceRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      url: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const url = input.url || slugify(input.name)
        
        console.log('Creating workspace for user:', {
          userId: ctx.session.user.id,
          email: ctx.session.user.email,
          url
        })

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
          },
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        })

        console.log('Created workspace:', workspace)
        console.log('With members:', workspace.members)

        return workspace
      } catch (error) {
        console.error('Workspace creation error:', error)
        throw error
      }
    }),

  // Get current workspace by URL
  getByUrl: protectedProcedure
    .input(z.object({
      url: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          url: input.url,
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        },
        include: {
          members: true,
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return workspace as WorkspaceWithMembers
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

  updateWorkspace: workspaceProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      url: z.string().min(1).optional(),
      avatar: z.object({
        type: z.enum(['initials', 'icon', 'image']),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate a consistent color based on workspace name if not provided
      const color = input.avatar?.color || stringToColor(input.name || ctx.workspace.name)

      const workspace = await ctx.prisma.workspace.update({
        where: { id: ctx.workspace.id },
        data: {
          name: input.name,
          url: input.url,
          avatarType: input.avatar?.type || 'initials',
          avatarIcon: input.avatar?.icon,
          avatarColor: color,
          avatarImageUrl: input.avatar?.imageUrl,
        }
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

  updateUrl: workspaceProcedure
    .input(z.object({
      url: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission
      const member = await ctx.prisma.workspaceMember.findFirst({
        where: {
          AND: [
            { workspaceId: ctx.session.workspace.id },
            { userId: ctx.session.user.id }
          ]
        }
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

  switch: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to workspace
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
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

      return workspace
    }),

  getMembers: protectedProcedure
    .input(z.object({ workspaceUrl: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.workspaceUrl },
      })

      if (!workspace) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              nickname: true,
              avatarType: true,
              avatarIcon: true,
              avatarColor: true,
              avatarImageUrl: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  inviteMembers: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string(),
      emails: z.array(z.string().email()),
      role: z.enum(['ADMIN', 'MEMBER', 'GUEST']),
      teamIds: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          url: input.workspaceUrl,
          members: {
            some: {
              userId: ctx.session.user.id,
              role: { in: ['OWNER', 'ADMIN'] }
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to invite members'
        })
      }

      // Create invites for each email
      const invites = await Promise.all(
        input.emails.map(async (email) => {
          // Check if user already exists
          const existingUser = await ctx.prisma.user.findUnique({
            where: { email }
          })

          if (existingUser) {
            // Add user directly to workspace if they exist
            await ctx.prisma.workspaceMember.create({
              data: {
                workspaceId: workspace.id,
                userId: existingUser.id,
                role: input.role
              }
            })

            // Add to teams if specified
            if (input.teamIds?.length) {
              await ctx.prisma.teamMember.createMany({
                data: input.teamIds.map(teamId => ({
                  teamId,
                  userId: existingUser.id,
                  role: 'MEMBER'
                }))
              })
            }

            return { email, status: 'ADDED' }
          }

          // Create invite for non-existing user
          const invite = await ctx.prisma.invite.create({
            data: {
              email,
              role: input.role,
              workspaceId: workspace.id,
              teamIds: input.teamIds,
              createdById: ctx.session.user.id,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
          })

          return { email, status: 'INVITED', inviteId: invite.id }
        })
      )

      return invites
    }),

  updateMemberStatus: protectedProcedure
    .input(z.object({
      userId: z.string(),
      status: z.enum(['ACTIVE', 'PENDING', 'DISABLED'])
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { status: input.status }
      })
    })
}) 