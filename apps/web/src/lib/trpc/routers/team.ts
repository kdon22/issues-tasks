import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamRouter = router({
  // Get all teams in a workspace
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.team.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          members: {
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
          },
        },
      })
    }),

  // Create a new team
  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        iconColor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create team and add creator as owner
      const team = await ctx.db.team.create({
        data: {
          ...input,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      })
      return team
    }),

  // Update team details
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        iconColor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return await ctx.db.team.update({
        where: { id },
        data,
      })
    }),

  // Delete a team
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.team.delete({
        where: { id: input.id },
      })
    }),
}) 