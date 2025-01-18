'use client'

import { Avatar } from '@/domains/shared/components/Avatar'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'
import { trpc } from '@/infrastructure/trpc/core/client'
import type { AvatarSize } from '@/domains/shared/components/Avatar/types'

interface TeamAvatarProps {
  teamId: string
  size?: AvatarSize
  className?: string
}

export function TeamAvatar({ teamId, size = 'md', className }: TeamAvatarProps) {
  const { data: team } = trpc.team.get.useQuery({ id: teamId })

  const { avatarData } = useAvatar(team!, 'team')

  if (!team) return null

  return (
    <Avatar
      data={avatarData}
      size={size}
      className={className}
    />
  )
} 