import { type AvatarType } from '@/lib/types/avatar'

export interface NavigationItem {
  id: string
  name: string
  avatarType: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
  // ... other fields
} 