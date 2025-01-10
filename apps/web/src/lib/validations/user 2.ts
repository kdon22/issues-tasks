import { z } from 'zod'
import { type AvatarType } from '@/lib/types/avatar'

export const userProfileUpdateSchema = z.object({
  name: z.string(),
  nickname: z.string().nullable(),
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
  imageUrl: z.string().nullable()
}) 