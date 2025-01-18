import { z } from 'zod'

export const userProfileUpdateSchema = z.object({
  name: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  avatarType: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']).optional(),
  avatarIcon: z.string().nullable().optional(),
  avatarColor: z.string().nullable().optional(),
  avatarEmoji: z.string().nullable().optional(),
  avatarImageUrl: z.string().nullable().optional(),
})

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema> 