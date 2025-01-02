import { router, protectedProcedure } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const teamRouter = router({
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Get all teams for the workspace
      const teams = await ctx.prisma.team.findMany({
        where: {
          workspaceId: input.workspaceId,
          members: {
            some: {
              userId: ctx.session.user.id
            }
          }
        },
        include: {
          _count: {
            select: {
              members: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      return teams
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      identifier: z.string().min(1).max(8),
      workspaceId: z.string(),
      avatar: z.object({
        type: z.enum(['initials', 'icon', 'image']),
        icon: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      // Create the team
      const team = await ctx.prisma.team.create({
        data: {
          name: input.name,
          identifier: input.identifier,
          workspaceId: input.workspaceId,
          avatarType: input.avatar.type,
          avatarIcon: input.avatar.icon,
          avatarColor: input.avatar.color,
          avatarImageUrl: input.avatar.imageUrl,
          // Add the creator as an OWNER
          members: {
            create: {
              userId: ctx.session.user.id,
              role: 'OWNER'
            }
          }
        }
      })

      return team
    }),
}) 