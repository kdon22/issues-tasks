'use client'

import { Avatar } from './Avatar'
import { type AvatarSize } from '@/types/avatar'

interface UserAvatarProps {
  user: {
    id: string
    name: string
    avatarType?: string
    avatarIcon?: string | null
    avatarColor?: string | null
    avatarImageUrl?: string | null
  }
  size?: AvatarSize
  showTooltip?: boolean
}

export function UserAvatar({ user, size, showTooltip }: UserAvatarProps) {
  return (
    <Avatar
      data={{
        id: user.id,
        name: user.name,
        type: user.avatarType || 'initials',
        icon: user.avatarIcon,
        color: user.avatarColor,
        imageUrl: user.avatarImageUrl
      }}
      size={size}
      showTooltip={showTooltip}
    />
  )
} 