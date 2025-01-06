import { z } from 'zod'
import type { AvatarType } from '@/lib/types/avatar'

export const avatarUpdateSchema = z.object({
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
  imageUrl: z.string().nullable(),
})

export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema> 