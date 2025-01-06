// Core avatar types
export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarType = 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE'

// UI-side avatar data
export interface AvatarData {
  type: AvatarType
  name: string  // Required for all avatar types
  icon?: string
  color?: string
  emoji?: string
  imageUrl?: string
}

// Database-side avatar data
export interface DatabaseAvatar {
  avatarType: AvatarType
  avatarIcon: string | null
  avatarColor: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
}

// Size configuration
export const AVATAR_SIZES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg'
}

// Conversion utilities
export const toUIAvatar = (dbAvatar: DatabaseAvatar, name: string): AvatarData => ({
  type: dbAvatar.avatarType,
  name,
  icon: dbAvatar.avatarIcon || undefined,
  color: dbAvatar.avatarColor || undefined,
  emoji: dbAvatar.avatarEmoji || undefined,
  imageUrl: dbAvatar.avatarImageUrl || undefined
})

export const toDatabaseAvatar = (uiAvatar: AvatarData): DatabaseAvatar => ({
  avatarType: uiAvatar.type,
  avatarIcon: uiAvatar.icon || null,
  avatarColor: uiAvatar.color || null,
  avatarEmoji: uiAvatar.emoji || null,
  avatarImageUrl: uiAvatar.imageUrl || null
}) 