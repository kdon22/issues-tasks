import { z } from 'zod'
import { type AvatarType } from '@/lib/types/avatar'
import { avatarUpdateSchema } from './avatar'

// Schema for updating user profile including avatar fields
export const userProfileUpdateSchema = z.object({
  name: z.string(),
  nickname: z.string().nullable(),
}).merge(avatarUpdateSchema)

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema> 