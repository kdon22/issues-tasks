'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { ChangeWorkspaceUrlDialog } from './ChangeWorkspaceUrlDialog'
import { IconPickerButton } from '@/components/ui/IconPickerButton'
import { type AvatarData } from '@/types/avatar'
import { Button } from '@/components/ui/Button'
import type { Workspace } from '@/lib/types/workspace'

interface GeneralSettingsProps {
  workspace: Workspace
}

export function GeneralSettings({ workspace }: GeneralSettingsProps) {
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const params = useParams()
  
  const [avatarData, setAvatarData] = useState<AvatarData>({
    type: 'INITIALS',
    name: workspace.name,
    icon: workspace.avatarIcon || undefined,
    color: workspace.avatarColor || undefined,
    emoji: workspace.avatarEmoji || undefined,
    imageUrl: workspace.avatarImageUrl || undefined
  })

  const utils = api.useContext()
  const updateMutation = api.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate()
    }
  })

  const handleAvatarChange = (newData: AvatarData) => {
    if (!workspace) return
    
    // Only update avatar-related fields
    updateMutation.mutate({
      workspaceId: workspace.id,
      name: workspace.name,
      url: workspace.url,
      avatarType: newData.type,
      avatarIcon: newData.icon,
      avatarColor: newData.color,
      avatarImageUrl: newData.imageUrl
    })

    setAvatarData(newData)
  }

  if (!workspace) return null

  return (
    <div className="space-y-8">
      {/* Icon & Workspace Name section */}
      <div>
        <h2 className="text-base font-medium text-gray-700 mb-4">
          Icon & Workspace Name
        </h2>
        <div className="flex items-center gap-4">
          <IconPickerButton
            data={avatarData}
            onChange={handleAvatarChange}
          />
          <span className="text-gray-900">{workspace.name}</span>
        </div>
      </div>

      {/* URL section */}
      <div>
        <h2 className="text-base font-medium text-gray-700 mb-4">URL</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Workspace URL
            </div>
            <div className="text-sm text-gray-500">
              {`issuestasks.com/${workspace.url}`}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsUrlDialogOpen(true)}
          >
            Change...
          </Button>
        </div>
      </div>

      {/* Danger zone section */}
      <div>
        <h2 className="text-base font-medium text-red-600 mb-4">Danger zone</h2>
        <div className="border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Delete workspace
              </div>
              <div className="text-sm text-gray-500">
                Schedule workspace to be permanently deleted
              </div>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete...
            </Button>
          </div>
        </div>
      </div>

      {/* URL Change Dialog */}
      <ChangeWorkspaceUrlDialog
        isOpen={isUrlDialogOpen}
        onClose={() => setIsUrlDialogOpen(false)}
        currentUrl={workspace.url}
      />
    </div>
  )
} 