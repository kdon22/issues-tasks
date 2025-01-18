import type { AvatarData } from '../types/avatar'

export function toAvatarFields(data: AvatarData) {
  const base = {
    avatarType: data.type === 'COLOR' ? 'INITIALS' : data.type,
    avatarColor: data.color || null
  }

  switch (data.type) {
    case 'ICON':
      return {
        ...base,
        avatarIcon: data.icon || null,
        avatarEmoji: null,
        avatarImageUrl: null
      }
    case 'EMOJI':
      return {
        ...base,
        avatarIcon: null,
        avatarEmoji: data.emoji || null,
        avatarImageUrl: null
      }
    case 'IMAGE':
      return {
        ...base,
        avatarIcon: null,
        avatarEmoji: null,
        avatarImageUrl: data.imageUrl || null
      }
    default:
      return {
        ...base,
        avatarIcon: null,
        avatarEmoji: null,
        avatarImageUrl: null
      }
  }
} 