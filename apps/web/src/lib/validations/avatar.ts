import { z } from 'zod'
import type { AvatarType } from '@/lib/types/avatar'

// Base avatar fields
const avatarBaseSchema = z.object({
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  emoji: z.string().nullable(),
  imageUrl: z.string().nullable(),
})

// Schema for updates that require a name
export const avatarSchema = avatarBaseSchema.extend({
  name: z.string()
})

// Schema for updates without name requirement
export const avatarUpdateSchema = avatarBaseSchema

export type AvatarInput = z.infer<typeof avatarSchema>
export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema> 