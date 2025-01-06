import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { type AvatarData } from '@/lib/types/avatar'
import { avatarService } from '@/lib/services/avatar'

export const avatarRouter = router({
  get: protectedProcedure
    .input(z.object({
      type: z.enum(['user', 'team', 'workspace']),
      id: z.string()
    }))
    .query(async ({ ctx, input }): Promise<AvatarData> => {
      return avatarService.get(input.type, input.id)
    })
}) 