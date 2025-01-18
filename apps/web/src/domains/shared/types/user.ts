import type { UserPreferences } from '@/domains/shared/constants/preferences'

export type AvatarType = 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'DISABLED'

export interface User {
  id: string
  email: string
  name: string | null
  displayName: string | null
  avatarType: AvatarType
  avatarIcon: string | null
  avatarColor: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
  createdAt: Date
  updatedAt: Date
  status: UserStatus
  notificationSettings: any
  preferences?: UserPreferences | null
  password: string
} 