import { router } from '../core/trpc'
import { userRouter } from './user'
import { avatarRouter } from './avatar'
import { publicProcedure, protectedProcedure } from '../core/trpc'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { teamRouter } from '@/domains/teams/api/router'

// Input validation schemas
const avatarSchema = z.object({
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE', 'COLOR']).transform(val => 
    val === 'COLOR' ? 'INITIALS' : val
  ),
  id: z.string(),
  entityType: z.enum(['user', 'workspace', 'team'])
})

const userSchema = z.object({
  id: z.string().optional()
})

const workspaceSchema = z.object({
  url: z.string()
})

// Common select fields for avatar queries
const avatarSelect = {
  name: true,
  avatar: true
} as const

const notificationSettingsSchema = z.object({
  email: z.object({
    marketing: z.boolean(),
    updates: z.boolean(),
    teamActivity: z.boolean()
  }),
  web: z.object({
    teamActivity: z.boolean(),
    mentions: z.boolean()
  })
})

const preferencesSchema = z.object({
  workspaceId: z.string(),
  preferences: z.object({
    defaultHomeView: z.enum(['MyIssues', 'ActiveIssues', 'AllIssues']),
    fontSize: z.enum(['Small', 'Default', 'Large']),
    interfaceTheme: z.enum(['System', 'Light', 'Dark']),
    displayFullNames: z.boolean(),
    usePointerCursor: z.boolean()
  })
})

// Router definitions
export const appRouter = router({
  user: userRouter,
  avatar: avatarRouter,

  workspace: router({
    get: protectedProcedure
      .input(workspaceSchema)
      .query(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.url }
        })

        if (!workspace) return null

        const baseAvatar = {
          name: workspace.name,
          value: workspace.name.substring(0, 2).toUpperCase(),
          color: workspace.avatarColor || '#000000'
        }

        let avatar;
        switch (workspace.avatarType) {
          case 'INITIALS':
            avatar = { ...baseAvatar, type: 'INITIALS' } as const;
            break;
          case 'ICON':
            avatar = { 
              ...baseAvatar, 
              type: 'ICON' as const,
              icon: workspace.avatarIcon || ''
            };
            break;
          case 'EMOJI':
            avatar = { 
              ...baseAvatar, 
              type: 'EMOJI' as const,
              emoji: workspace.avatarEmoji || ''
            };
            break;
          case 'IMAGE':
            avatar = { 
              ...baseAvatar, 
              type: 'IMAGE' as const,
              imageUrl: workspace.avatarImageUrl || ''
            };
            break;
          default:
            avatar = { ...baseAvatar, type: 'COLOR' as const };
        }

        return {
          ...workspace,
          avatar
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const user = ctx.session?.user
        if (!user?.id) {
          throw new Error('Not authenticated')
        }
        return ctx.prisma.workspace.findMany({
          where: { members: { some: { userId: user.id } } }
        })
      }),

    getCurrent: protectedProcedure
      .query(async ({ ctx }) => {
        const user = ctx.session?.user
        if (!user?.id) {
          throw new Error('Not authenticated')
        }
        return ctx.prisma.workspace.findFirst({
          where: { members: { some: { userId: user.id } } }
        })
      }),

    teams: router({
      list: protectedProcedure
        .input(z.object({ workspaceUrl: z.string() }))
        .query(async ({ ctx, input }) => {
          return ctx.prisma.team.findMany({
            where: { workspace: { url: input.workspaceUrl } },
            include: {
              _count: {
                select: { members: true }
              }
            }
          })
        })
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        url: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.session?.user
        return ctx.prisma.workspace.create({
          data: {
            name: input.name,
            url: input.url,
            members: {
              create: {
                userId: user.id,
                role: 'OWNER'
              }
            }
          }
        })
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        url: z.string().optional(),
        avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']).optional(),
        avatarIcon: z.string().nullable().optional(),
        avatarColor: z.string().nullable().optional(),
        avatarEmoji: z.string().nullable().optional(),
        avatarImageUrl: z.string().nullable().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input
        return ctx.prisma.workspace.update({
          where: { id },
          data
        })
      }),

    getInvite: protectedProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ ctx, input }) => {
        const invite = await ctx.prisma.workspaceInvite.findUnique({
          where: { code: input.token },
          include: {
            workspace: true
          }
        })

        if (!invite) {
          throw new Error('Invitation not found')
        }

        if (invite.expiresAt < new Date()) {
          throw new Error('Invitation expired')
        }

        return invite
      }),

    join: protectedProcedure
      .input(z.object({ 
        token: z.string(),
        role: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const invite = await ctx.prisma.workspaceInvite.findUnique({
          where: { code: input.token },
          include: { workspace: true }
        })

        if (!invite) {
          throw new Error('Invitation not found')
        }

        // Create workspace member
        await ctx.prisma.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: ctx.session.user.id,
            role: input.role
          }
        })

        // Delete invitation
        await ctx.prisma.workspaceInvite.delete({
          where: { id: invite.id }
        })

        return invite.workspace
      }),

    listInvites: protectedProcedure
      .input(z.object({ 
        workspaceUrl: z.string() 
      }))
      .query(async ({ ctx, input }) => {
        return ctx.prisma.workspaceInvite.findMany({
          where: { 
            workspace: { url: input.workspaceUrl }
          }
        })
      }),

    createInvite: protectedProcedure
      .input(z.object({
        workspaceUrl: z.string(),
        email: z.string().email(),
        role: z.enum(['ADMIN', 'MEMBER'])
      }))
      .mutation(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.workspaceUrl }
        })
        if (!workspace) throw new Error('Workspace not found')

        return ctx.prisma.workspaceInvite.create({
          data: {
            workspaceId: workspace.id,
            email: input.email,
            role: input.role,
            invitedById: ctx.session.user.id,
            code: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
      }),

    cancelInvite: protectedProcedure
      .input(z.object({ 
        id: z.string() 
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.workspaceInvite.delete({
          where: { id: input.id }
        })
      }),

    listMembers: protectedProcedure
      .input(z.object({ 
        workspaceUrl: z.string() 
      }))
      .query(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.workspaceUrl }
        })
        if (!workspace) throw new Error('Workspace not found')

        return ctx.prisma.workspaceMember.findMany({
          where: { workspaceId: workspace.id },
          include: {
            user: true
          }
        })
      }),

    updateMemberRole: protectedProcedure
      .input(z.object({
        workspaceUrl: z.string(),
        memberId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER'])
      }))
      .mutation(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.workspaceUrl }
        })
        if (!workspace) throw new Error('Workspace not found')

        return ctx.prisma.workspaceMember.update({
          where: { id: input.memberId },
          data: { role: input.role }
        })
      }),

    removeMember: protectedProcedure
      .input(z.object({
        workspaceUrl: z.string(),
        memberId: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: { url: input.workspaceUrl }
        })
        if (!workspace) throw new Error('Workspace not found')

        return ctx.prisma.workspaceMember.delete({
          where: { id: input.memberId }
        })
      })
  }),

  team: teamRouter,

  teamMember: router({
    list: protectedProcedure
      .input(z.object({ 
        teamId: z.string() 
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.session) throw new Error('Not authenticated')

        return ctx.prisma.teamMember.findMany({
          where: { teamId: input.teamId },
          include: {
            user: true
          }
        })
      }),

    add: protectedProcedure
      .input(z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER'])
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.session) throw new Error('Not authenticated')
        return ctx.prisma.teamMember.create({
          data: {
            teamId: input.teamId,
            userId: input.userId,
            role: input.role
          },
          include: {
            user: true
          }
        })
      }),

    update: protectedProcedure
      .input(z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER'])
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.teamMember.update({
          where: {
            userId_teamId: {
              userId: input.userId,
              teamId: input.teamId
            }
          },
          data: {
            role: input.role
          },
          include: {
            user: true
          }
        })
      }),

    remove: protectedProcedure
      .input(z.object({
        teamId: z.string(),
        userId: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.teamMember.delete({
          where: {
            userId_teamId: {
              userId: input.userId,
              teamId: input.teamId
            }
          }
        })
      })
  }),

  auth: router({
    signup: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
        workspaceName: z.string(),
        workspaceUrl: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const hashedPassword = await hash(input.password, 12)
        
        return ctx.prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            workspaces: {
              create: {
                workspace: {
                  create: {
                    name: input.workspaceName,
                    url: input.workspaceUrl
                  }
                },
                role: 'OWNER'
              }
            }
          }
        })
      }),

    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { email: input.email }
        })

        if (user) {
          // TODO: Send password reset email
          // For now, just return success
        }

        // Always return success to prevent email enumeration
        return { success: true }
      }),
  }),

  invitation: router({
    accept: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.session?.user?.id) throw new Error('Not authenticated')

        const invitation = await ctx.prisma.workspaceInvite.findUnique({
          where: { code: input.code },
          include: { workspace: true }
        })

        if (!invitation) {
          throw new Error('Invitation not found')
        }

        if (invitation.expiresAt < new Date()) {
          throw new Error('Invitation expired')
        }

        // Create workspace member
        await ctx.prisma.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: ctx.session.user.id,
            role: invitation.role
          }
        })

        // Create team members
        if (invitation.teamIds.length > 0) {
          await ctx.prisma.teamMember.createMany({
            data: invitation.teamIds.map(teamId => ({
              teamId,
              userId: ctx.session.user.id,
              role: 'MEMBER'
            }))
          })
        }

        // Delete invitation
        await ctx.prisma.workspaceInvite.delete({
          where: { id: invitation.id }
        })

        return {
          workspace: invitation.workspace,
          teamIds: invitation.teamIds
        }
      })
  })
})

export type AppRouter = typeof appRouter