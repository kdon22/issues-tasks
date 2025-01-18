import { router, protectedProcedure } from '@/infrastructure/trpc/core/trpc'
import { z } from 'zod'
import { getTeamActivity } from '../activity'

const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  workspaceId: z.string(),
  settings: z.object({
    allowMemberInvites: z.boolean(),
    requireAdminApproval: z.boolean()
  }).optional(),
  members: z.array(z.object({
    userId: z.string(),
    role: z.enum(['ADMIN', 'MEMBER'])
  })).optional()
})

const memberSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER'])
})

const settingsSchema = z.object({
  isPrivate: z.boolean(),
  allowMemberInvites: z.boolean(),
  requireAdminApproval: z.boolean()
})

export const teamRouter = router({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.team.findUnique({
        where: { id: input.id }
      })
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.team.findMany({
        where: { workspaceId: input.workspaceId }
      })
    }),

  update: protectedProcedure
    .input(teamSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const { members, ...teamData } = input
      
      return ctx.prisma.team.update({
        where: { id: input.id },
        data: {
          ...teamData,
          members: members ? {
            updateMany: members.map(member => ({
              where: { userId: member.userId },
              data: { role: member.role }
            }))
          } : undefined
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.delete({
        where: { id: input.id }
      })
    }),

  addMember: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      email: z.string().email(),
      role: z.enum(['ADMIN', 'MEMBER'])
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email }
      })
      if (!user) throw new Error('User not found')

      return ctx.prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: user.id,
          role: input.role
        }
      })
    }),

  updateMemberRole: protectedProcedure
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
        data: { role: input.role }
      })
    }),

  removeMember: protectedProcedure
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
    }),

  updateSettings: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      settings: settingsSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.update({
        where: { id: input.teamId },
        data: { settings: input.settings }
      })
    }),

  activities: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input }) => {
      return getTeamActivity(input.teamId)
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      identifier: z.string(),
      workspaceUrl: z.string(),
      type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE', 'COLOR']),
      value: z.string(),
      color: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspaceId: input.workspaceUrl,
          avatarType: input.type,
          avatarColor: input.color
        }
      })
    })
}) 