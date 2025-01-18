'use client'

import { useState } from 'react'
import { trpc } from '@/infrastructure/trpc/core/client'
import type { AvatarType } from '@/domains/shared/types/user'

export type EntityType = 'user' | 'workspace' | 'team'

export interface AvatarData {
  type: AvatarType
  name: string
  value: string
  color: string
}

export interface HasAvatar {
  id: string
  name: string | null
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
}

export function useAvatar(entity: HasAvatar, entityType: EntityType) {
  const [isUpdating, setIsUpdating] = useState(false)
  const utils = trpc.useContext()

  const avatarData: AvatarData = {
    type: entity.avatarType,
    name: entity.name || '',
    value: entity.avatarIcon || entity.avatarEmoji || entity.avatarImageUrl || '',
    color: entity.avatarColor || '#000000'
  }

  const { mutate: updateAvatar } = trpc.avatar.update.useMutation({
    onMutate: () => setIsUpdating(true),
    onSettled: () => setIsUpdating(false),
    onSuccess: () => {
      utils.avatar.get.invalidate()
    }
  })

  return {
    avatarData,
    isUpdating,
    updateAvatar: (data: AvatarData) => updateAvatar({
      entityType,
      id: entity.id,
      data
    })
  }
} 