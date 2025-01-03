'use client'

import { useQuery } from '@tanstack/react-query'
import { Avatar } from './Avatar'
import { type AvatarData, type AvatarSize } from '@/types/avatar'

type EntityType = 'user' | 'team' | 'workspace' | 'project'

interface EntityAvatarProps {
  type: EntityType
  id: string
  size?: AvatarSize
}

export function EntityAvatar({ type, id, size = 'md' }: EntityAvatarProps) {
  const { data: avatar } = useQuery<AvatarData>({
    queryKey: ['avatar', type, id],
    queryFn: () => fetch(`/api/avatar/${type}/${id}`).then(res => res.json())
  })

  if (!avatar) return null
  
  return (
    <Avatar 
      {...avatar} 
      size={size} 
      entityType={type === 'user' ? 'user' : 'entity'}
    />
  )
} 