'use client'

import { Avatar } from './Avatar'
import { type HasAvatar, toAvatarData } from '@/lib/types/avatar'
import type { AvatarSize } from '@/lib/types/avatar'

interface EntityAvatarProps {
  entity: HasAvatar & { name: string }
  size?: AvatarSize
  className?: string
}

export function EntityAvatar({ entity, size, className }: EntityAvatarProps) {
  return (
    <Avatar 
      data={toAvatarData(entity)}
      size={size}
      className={className}
    />
  )
} 