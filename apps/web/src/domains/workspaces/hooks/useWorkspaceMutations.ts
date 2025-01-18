'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { AvatarData } from '@/domains/shared/types/avatar'
import { toAvatarFields } from '@/domains/shared/utils/avatar'

export function useWorkspaceMutations(workspaceId: string) {
  const utils = trpc.useContext()

  const { mutate: updateName, isLoading: isUpdatingName } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate({ id: workspaceId })
      utils.workspace.list.invalidate()
    }
  })

  const { mutate: updateUrl, isLoading: isUpdatingUrl } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate({ id: workspaceId })
      utils.workspace.list.invalidate()
    }
  })

  const { mutate: updateAvatar, isLoading: isUpdatingAvatar } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate({ id: workspaceId })
      utils.workspace.list.invalidate()
    }
  })

  return {
    updateName: (name: string) => updateName({ id: workspaceId, name }),
    updateUrl: (url: string) => updateUrl({ id: workspaceId, url }),
    updateAvatar: (avatarData: AvatarData) => updateAvatar({
      id: workspaceId,
      ...toAvatarFields(avatarData)
    }),
    isLoading: isUpdatingName || isUpdatingUrl || isUpdatingAvatar
  }
} 