'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { AvatarPicker } from '@/components/ui/AvatarPicker/AvatarPicker'
import { type AvatarData, toAvatarData, toAvatarFields } from '@/lib/types/avatar'

export function WorkspaceGeneralSettings() {
  const { workspace, updateWorkspaceData } = useWorkspace()
  const utils = api.useContext()

  const updateAvatar = api.workspace.updateAvatar.useMutation({
    onSuccess: (updatedWorkspace) => {
      updateWorkspaceData(updatedWorkspace)
      utils.workspace.getCurrent.invalidate()
      utils.workspace.list.invalidate()
    }
  })

  if (!workspace) return null

  const handleAvatarChange = async (avatarData: AvatarData) => {
    await updateAvatar.mutateAsync({
      workspaceId: workspace.id,
      name: workspace.name,
      type: avatarData.type,
      icon: avatarData.type === 'ICON' ? avatarData.icon : null,
      color: 'color' in avatarData ? avatarData.color : null,
      emoji: avatarData.type === 'EMOJI' ? avatarData.emoji : null,
      imageUrl: avatarData.type === 'IMAGE' ? avatarData.imageUrl : null
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Workspace Avatar</h3>
        <AvatarPicker
          data={toAvatarData({ ...workspace, name: workspace.name })}
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  )
} 