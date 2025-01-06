'use client'

import { api } from '@/lib/trpc/client'
import { Avatar } from './Avatar'
import { Skeleton } from './Skeleton'
import { type AvatarSize, AVATAR_SIZES } from '@/lib/types/avatar'

interface EntityAvatarProps {
  entityId: string
  entityType: 'workspace' | 'team' | 'user'
  size?: AvatarSize
  className?: string
}

export function EntityAvatar({ entityId, entityType, size = 'md', className }: EntityAvatarProps) {
  const { data: avatarData, isLoading, error } = api.avatar.get.useQuery(
    { type: entityType, id: entityId },
    { enabled: !!entityId }
  )

  if (error || !avatarData) {
    return null
  }

  if (isLoading) {
    return <Skeleton className={`rounded-full ${AVATAR_SIZES[size]}`} />
  }

  return (
    <Avatar 
      data={avatarData}
      size={size}
      className={className}
    />
  )
} 