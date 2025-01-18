'use client'

import { Avatar } from '@/domains/shared/components/Avatar'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'
import type { AvatarSize } from '@/domains/shared/components/Avatar/types'
import type { User } from './types'

interface UserAvatarProps {
  user: User
  size?: AvatarSize
  className?: string
}

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const { avatarData } = useAvatar(user, 'user')

  return (
    <Avatar
      data={avatarData}
      size={size}
      className={className}
    />
  )
} 