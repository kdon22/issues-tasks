'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import type { AvatarData } from '@/types/avatar'

interface UseAvatarProps {
  type: 'workspace' | 'user' | 'team'
  id: string
  initialData?: AvatarData
}

export function useAvatar({ type, id, initialData }: UseAvatarProps) {
  const [avatarData, setAvatarData] = useState<AvatarData>(initialData || {
    type: 'INITIALS',
    name: '',
  })

  const utils = api.useContext()

  // Map entity type to correct router procedure
  const updateMutation = {
    user: api.user.updateAvatar,
    team: api.team.updateAvatar,
    workspace: api.workspace.updateAvatar
  }[type].useMutation({
    onSuccess: () => {
      utils.invalidate()
    },
  })

  const updateAvatar = async (newData: Partial<AvatarData>) => {
    const updatedData = { ...avatarData, ...newData }
    setAvatarData(updatedData)
    
    await updateMutation.mutateAsync({
      id,
      avatarType: updatedData.type,
      avatarIcon: updatedData.icon,
      avatarColor: updatedData.color,
      avatarEmoji: updatedData.emoji,
      avatarImageUrl: updatedData.imageUrl,
    })
  }

  return {
    avatarData,
    updateAvatar,
    isLoading: updateMutation.isLoading,
    error: updateMutation.error,
  }
} 