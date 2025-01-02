'use client'

import { Avatar } from './Avatar'
import { type AvatarSize } from '@/types/avatar'

interface TeamAvatarProps {
  team: {
    name: string
    avatarType?: string
    avatarIcon?: string | null
    avatarColor?: string | null
    avatarImageUrl?: string | null
  }
  size?: AvatarSize
  showTooltip?: boolean
}

export function TeamAvatar({ team, size, showTooltip }: TeamAvatarProps) {
  return (
    <Avatar
      data={{
        id: team.name, // Use name as id for new teams that don't have an id yet
        name: team.name,
        type: team.avatarType || 'initials',
        icon: team.avatarIcon,
        color: team.avatarColor,
        imageUrl: team.avatarImageUrl
      }}
      size={size}
      showTooltip={showTooltip}
    />
  )
} 