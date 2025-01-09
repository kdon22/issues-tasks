'use client'

import { EntityAvatar } from '@/components/ui/EntityAvatar'
import type { User } from '@prisma/client'
import type { AvatarSize } from '@/lib/types/avatar'

interface UserAvatarProps {
  user: User
  size?: AvatarSize
  className?: string
}

export function UserAvatar({ user, size, className }: UserAvatarProps) {
  return (
    <EntityAvatar 
      entity={{ ...user, name: user.name || 'Unknown' }}
      size={size}
      className={className}
    />
  )
} 