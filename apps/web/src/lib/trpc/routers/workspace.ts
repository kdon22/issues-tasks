import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { avatarUpdateSchema } from '@/lib/validations/avatar'
import { type AvatarData } from '@/lib/types/avatar'
import { generateInviteCode } from '@/lib/utils'

export const workspaceRouter = router({
  getCurrent: protectedProcedure
    .input(z.object({ url: z.string() }))
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
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or access denied'
        })
      }

      await ctx.prisma.workspaceMember.updateMany({
        where: {
          userId: ctx.session.user.id,
          workspaceId: workspace.id
        },
        data: {
          lastAccessedAt: new Date()
        }
      })

      return workspace
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    }),

  updateLastAccessed: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.workspaceMember.updateMany({
        where: {
          workspaceId: input.id,
          userId: ctx.session.user.id
        },
        data: {
          lastAccessedAt: new Date()
        }
      })
      return true
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      ...avatarUpdateSchema.shape
    }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, ...avatarData } = input

      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          members: {
            some: {
              userId: ctx.session.user.id,
              role: 'ADMIN'
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this workspace'
        })
      }

      return ctx.prisma.workspace.update({
        where: { id: workspaceId },
        data: avatarData,
        select: {
          id: true,
          name: true,
          ...avatarUpdateSchema.shape
        }
      })
    }),

  getMembers: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.workspaceMember.findMany({
        where: {
          workspace: {
            url: input.workspaceUrl
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    }),

  join: protectedProcedure
    .input(z.object({
      inviteCode: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.prisma.workspaceInvite.findUnique({
        where: { code: input.inviteCode },
        include: { workspace: true }
      })

      if (!invite || invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid or expired invite code'
        })
      }

      await ctx.prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: ctx.session.user.id,
          role: invite.role
        }
      })

      return invite.workspace
    }),

  updateUrl: protectedProcedure
    .input(z.object({
      url: z.string()
        .min(3, 'URL must be at least 3 characters')
        .max(50, 'URL must be less than 50 characters')
        .regex(/^[a-z0-9-]+$/, 'URL can only contain lowercase letters, numbers, and hyphens')
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if URL is already taken
      const existing = await ctx.prisma.workspace.findUnique({
        where: { url: input.url }
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This URL is already taken'
        })
      }

      return ctx.prisma.workspace.update({
        where: { id: ctx.session.workspace?.id },
        data: { url: input.url }
      })
    }),

  update: protectedProcedure
    .input(z.object({
      url: z.string(),
      name: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable(),
      avatarColor: z.string().nullable(),
      avatarEmoji: z.string().nullable(),
      avatarImageUrl: z.string().nullable()
    }))
    .mutation(async ({ ctx, input }) => {
      // Find workspace by url instead of id
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.url }
      })

      if (!workspace) throw new Error('Workspace not found')

      return ctx.prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          name: input.name,
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl
        }
      })
    }),

  inviteMembers: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      emails: z.array(z.string().email()),
      role: z.enum(['ADMIN', 'MEMBER', 'GUEST']),
      teamIds: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, emails, role, teamIds } = input

      // Create workspace invites
      const invites = await Promise.all(
        emails.map(async (email) => {
          const invite = await ctx.prisma.workspaceInvite.create({
            data: {
              email,
              role,
              workspaceId,
              invitedById: ctx.session.user.id,
              teamIds: teamIds || [],
              code: generateInviteCode(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
          })
          
          // TODO: Send invite email
          
          return invite
        })
      )

      return invites
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      url: z.string()
        .min(3, 'URL must be at least 3 characters')
        .max(50, 'URL must be less than 50 characters')
        .regex(/^[a-z0-9-]+$/, 'URL can only contain lowercase letters, numbers, and hyphens')
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if URL is already taken
      const existing = await ctx.prisma.workspace.findUnique({
        where: { url: input.url }
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This URL is already taken'
        })
      }

      // Create workspace and add current user as owner
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          url: input.url,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'OWNER'
            }
          }
        }
      })

      return workspace
    })
}) 