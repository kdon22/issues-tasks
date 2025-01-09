'use client'

import { EntityAvatar } from '@/components/ui/EntityAvatar'
import type { Team } from '@prisma/client'
import type { AvatarSize } from '@/lib/types/avatar'

interface TeamAvatarProps {
  team: Team
  size?: AvatarSize
  className?: string
}

export function TeamAvatar({ team, size, className }: TeamAvatarProps) {
  return (
    <EntityAvatar 
      entity={team}
      size={size}
      className={className}
    />
  )
} 