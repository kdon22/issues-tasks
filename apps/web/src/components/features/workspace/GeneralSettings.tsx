'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { ChangeWorkspaceUrlDialog } from './ChangeWorkspaceUrlDialog'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <AvatarPicker
          value={{
            type: workspace.avatarType,
            icon: workspace.avatarIcon || undefined,
            color: workspace.avatarColor || 'bg-blue-500',
            emoji: workspace.avatarEmoji || undefined,
            imageUrl: workspace.avatarImageUrl || undefined,
            name: workspace.name
          }}
          onChange={(newData) => {
            updateWorkspace.mutate({
              name: workspace.name,
              url: workspace.url,
              avatarType: newData.type,
              avatarIcon: newData.icon || null,
              avatarColor: newData.color || null,
              avatarEmoji: newData.emoji || null,
              avatarImageUrl: newData.imageUrl || null
            })
          }}
          name={workspace.name}
        />
        {/* Rest of the component */}
      </div>
    </div>
  )
} 