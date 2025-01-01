'use client'

import { Avatar } from './Avatar'
import { type AvatarSize } from '@/types/avatar'

interface UserAvatarProps {
  user: {
    id: string
    name: string
    avatarUrl?: string | null
    icon?: string | null
    iconColor?: string | null
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
        avatarUrl: user.avatarUrl,
        icon: user.icon,
        color: user.iconColor
      }}
      type="user"
      size={size}
      showTooltip={showTooltip}
    />
  )
} 