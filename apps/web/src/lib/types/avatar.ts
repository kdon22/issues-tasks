// Core avatar types
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarType = 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE'

// Base interface for all avatar types
export interface BaseAvatarData {
  name: string
}

// Type-specific interfaces
export interface InitialsAvatarData extends BaseAvatarData {
  type: 'INITIALS'
  color: string | null
}

export interface IconAvatarData extends BaseAvatarData {
  type: 'ICON'
  icon: string | null
  color: string | null
}

export interface EmojiAvatarData extends BaseAvatarData {
  type: 'EMOJI'
  emoji: string | null
}

export interface ImageAvatarData extends BaseAvatarData {
  type: 'IMAGE'
  imageUrl: string | null
}

// Union type for all possible avatar data
export type AvatarData = InitialsAvatarData | IconAvatarData | EmojiAvatarData | ImageAvatarData

// Database interface (matches Prisma schema)
export interface HasAvatar {
  avatarType: AvatarType
  avatarIcon: string | null
  avatarColor: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
}

// Conversion utilities
export function toAvatarData(entity: HasAvatar & { name: string }): AvatarData {
  switch (entity.avatarType) {
    case 'INITIALS':
      return { type: 'INITIALS', name: entity.name, color: entity.avatarColor }
    case 'ICON':
      return { type: 'ICON', name: entity.name, icon: entity.avatarIcon, color: entity.avatarColor }
    case 'EMOJI':
      return { type: 'EMOJI', name: entity.name, emoji: entity.avatarEmoji }
    case 'IMAGE':
      return { type: 'IMAGE', name: entity.name, imageUrl: entity.avatarImageUrl }
  }
}

export function toAvatarFields(data: AvatarData): HasAvatar {
  switch (data.type) {
    case 'INITIALS':
      return {
        avatarType: 'INITIALS',
        avatarIcon: null,
        avatarColor: data.color,
        avatarEmoji: null,
        avatarImageUrl: null
      }
    case 'ICON':
      return {
        avatarType: 'ICON',
        avatarIcon: data.icon,
        avatarColor: data.color,
        avatarEmoji: null,
        avatarImageUrl: null
      }
    case 'EMOJI':
      return {
        avatarType: 'EMOJI',
        avatarIcon: null,
        avatarColor: null,
        avatarEmoji: data.emoji,
        avatarImageUrl: null
      }
    case 'IMAGE':
      return {
        avatarType: 'IMAGE',
        avatarIcon: null,
        avatarColor: null,
        avatarEmoji: null,
        avatarImageUrl: data.imageUrl
      }
  }
}

// Size configuration
export const AVATAR_SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-14 h-14 text-xl'
} 