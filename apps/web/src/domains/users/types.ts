import type { AvatarType } from '@/domains/shared/types/avatar'
import type { UserPreferences } from '@/domains/shared/constants/preferences'

// User profile types
export interface User {
  id: string
  name: string
  email: string
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
  settings?: NotificationSettings
  preferences?: UserPreferences
}

// Notification types
export interface NotificationSettings {
  email: {
    marketing: boolean
    updates: boolean
    teamActivity: boolean
  }
  web: {
    teamActivity: boolean
    mentions: boolean
  }
}

// Security types
export interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Profile types
export interface ProfileSettings {
  name: string
  email: string
  avatar?: {
    type: AvatarType
    color?: string
    icon?: string
    emoji?: string
    imageUrl?: string
  }
}

// Re-export preference types
export type { 
  HomeView,
  FontSize,
  Theme 
} from '@/domains/shared/constants/preferences' 