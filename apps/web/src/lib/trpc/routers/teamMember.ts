import { router, protectedProcedure } from '../server'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamMemberRouter = router({
  // List members of a team
  list: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.teamMember.findMany({
        where: { teamId: input.teamId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              icon: true,
              iconColor: true,
            },
          },
        },
      })
    }),

  // Add member to team
  add: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(['MEMBER', 'ADMIN', 'GUEST']).default('MEMBER'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to add members
      const currentMember = await ctx.db.teamMember.findFirst({
        where: {
          teamId: input.teamId,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!currentMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add members to this team',
        })
      }

      return await ctx.db.teamMember.create({
        data: input,
        include: {
          user: true,
        },
      })
    }),

  // Update member role
  updateRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(['MEMBER', 'ADMIN', 'GUEST']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to update roles
      const currentMember = await ctx.db.teamMember.findFirst({
        where: {
          teamId: input.teamId,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!currentMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update member roles',
        })
      }

      return await ctx.db.teamMember.update({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
        data: { role: input.role },
      })
    }),

  // Remove member from team
  remove: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to remove members
      const currentMember = await ctx.db.teamMember.findFirst({
        where: {
          teamId: input.teamId,
          userId: ctx.session.user.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!currentMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to remove members',
        })
      }

      return await ctx.db.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })
    }),
}) 