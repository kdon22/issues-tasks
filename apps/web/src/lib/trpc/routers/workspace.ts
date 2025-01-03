import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const workspaceRouter = router({
  getCurrent: protectedProcedure
    .input(z.object({
      url: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.url },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return workspace
    }),

  getMembers: protectedProcedure
    .input(
      z.object({
        workspaceUrl: z.string().min(1)
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { url: input.workspaceUrl },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found'
        })
      }

      return workspace.members
    }),

  getTeams: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string()
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.team.findMany({
        where: {
          workspace: {
            url: input.workspaceUrl
          }
        },
        include: {
          _count: {
            select: { 
              members: true,
              issues: true 
            }
          }
        }
      })
    }),

  updateAvatar: protectedProcedure
    .input(z.object({
      id: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable().optional(),
      avatarColor: z.string().nullable().optional(),
      avatarEmoji: z.string().nullable().optional(),
      avatarImageUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workspace.update({
        where: { id: input.id },
        data: {
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl,
        }
      })
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      url: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          url: input.url,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'ADMIN'
            }
          }
        }
      })

      return { url: workspace.url }
    }),

  inviteMembers: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      emails: z.array(z.string().email()),
      teamIds: z.array(z.string()).optional(),
      role: z.enum(['ADMIN', 'MEMBER', 'GUEST']).default('MEMBER')
    }))
    .mutation(async ({ ctx, input }) => {
      // First find or create users
      const users = await Promise.all(
        input.emails.map(async (email) => {
          const user = await ctx.prisma.user.findUnique({ where: { email } })
          if (!user) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `User with email ${email} not found`
            })
          }
          return user
        })
      )

      // Create workspace members
      await ctx.prisma.workspaceMember.createMany({
        data: users.map(user => ({
          workspaceId: input.workspaceId,
          userId: user.id,
          role: input.role
        })),
        skipDuplicates: true
      })

      return { success: true }
    }),

  update: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      name: z.string(),
      url: z.string(),
      avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
      avatarIcon: z.string().nullable().optional(),
      avatarColor: z.string().nullable().optional(),
      avatarEmoji: z.string().nullable().optional(),
      avatarImageUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workspace.update({
        where: { id: input.workspaceId },
        data: {
          name: input.name,
          url: input.url,
          avatarType: input.avatarType,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          avatarEmoji: input.avatarEmoji,
          avatarImageUrl: input.avatarImageUrl,
        }
      })
    }),

  updateUrl: protectedProcedure
    .input(z.object({
      url: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workspace.update({
        where: { id: ctx.session.workspace.id },
        data: { url: input.url }
      })
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const workspaces = await ctx.prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        }
      })
      return workspaces
    }),

  createTeam: protectedProcedure
    .input(z.object({
      workspaceUrl: z.string(),
      name: z.string(),
      identifier: z.string(),
      avatar: z.object({
        type: z.enum(['initials', 'icon', 'emoji', 'image']),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        emoji: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspace: {
            connect: {
              url: input.workspaceUrl
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
    })
}) 