import type { HasAvatar } from './types'

export function toAvatarData(entity: HasAvatar) {
  return {
    ...entity,
    avatarType: entity.avatarType === 'COLOR' ? 'INITIALS' : entity.avatarType
  }
} 