'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { ChangeWorkspaceUrlDialog } from './ChangeWorkspaceUrlDialog'
import { AvatarPicker } from '@/components/ui/AvatarPicker/AvatarPicker'
import { type AvatarData } from '@/lib/types/avatar'
import { Button } from '@/components/ui/Button'
import type { Workspace } from '@/lib/types/workspace'

export function GeneralSettings({ workspace }: { workspace: Workspace }) {
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const utils = api.useContext()

  const updateWorkspace = api.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate()
    }
  })

  const handleAvatarChange = async (newData: AvatarData) => {
    await updateWorkspace.mutateAsync({
      workspaceId: workspace.id,
      name: workspace.name,
      type: newData.type,
      icon: newData.type === 'ICON' ? newData.icon : null,
      color: 'color' in newData ? newData.color : null,
      emoji: newData.type === 'EMOJI' ? newData.emoji : null,
      imageUrl: newData.type === 'IMAGE' ? newData.imageUrl : null
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <AvatarPicker
          data={{
            type: workspace.avatarType,
            icon: workspace.avatarIcon || null,
            color: workspace.avatarColor || 'bg-blue-500',
            emoji: workspace.avatarEmoji || null,
            imageUrl: workspace.avatarImageUrl || null,
            name: workspace.name
          }}
          onChange={handleAvatarChange}
        />
        {/* Rest of the component */}
      </div>
    </div>
  )
} 