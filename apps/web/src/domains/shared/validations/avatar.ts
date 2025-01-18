import { z } from 'zod'
import { type BackgroundColor } from '../types/avatar'

const backgroundColors = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-gray-500'
] as const

export const avatarSchema = z.object({
  type: z.enum(['INITIALS', 'ICON', 'EMOJI', 'IMAGE']),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.enum(backgroundColors).nullable(),
  emoji: z.string().nullable(),
  imageUrl: z.string().nullable()
})

export const avatarUpdateSchema = avatarSchema.partial()

export type AvatarInput = z.infer<typeof avatarSchema>
export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema> 