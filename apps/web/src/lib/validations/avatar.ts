import { z } from 'zod'

export const avatarSchema = z.object({
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
  imageUrl: z.string().nullable()
})

export type AvatarInput = z.infer<typeof avatarSchema> 