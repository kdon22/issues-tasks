import { type AvatarType } from '@/lib/types/avatar'

export interface TeamItem {
  id: string
  name: string
  identifier: string
  avatarType: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
} 