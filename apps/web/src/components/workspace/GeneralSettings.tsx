'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { ChangeWorkspaceUrlDialog } from './ChangeWorkspaceUrlDialog'
import { IconPickerButton } from '@/components/ui/IconPickerButton'
import { type AvatarData } from '@/types/avatar'
import { Button } from '@/components/ui/Button'

export function GeneralSettings() {
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string
  
  const { data: workspace } = trpc.workspace.getByUrl.useQuery({ 
    url: workspaceUrl
  }, {
    enabled: !!workspaceUrl,
  })

  const [avatarData, setAvatarData] = useState<AvatarData>({
    id: '',
    name: '',
    type: 'initials',
    icon: null,
    color: null,
    imageUrl: null
  })

  useEffect(() => {
    if (workspace) {
      setAvatarData({
        id: workspace.id,
        name: workspace.name,
        type: workspace.avatarType as 'initials' | 'icon' | 'image' || 'initials',
        icon: workspace.avatarIcon || null,
        color: workspace.avatarColor || null,
        imageUrl: workspace.avatarImageUrl || null
      })
    }
  }, [workspace])

  const utils = trpc.useContext()
  const updateWorkspaceMutation = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: () => {
      utils.workspace.getByUrl.invalidate()
    }
  })

  const handleAvatarChange = (newData: AvatarData) => {
    if (!workspace) return
    
    // Only update avatar-related fields
    updateWorkspaceMutation.mutate({
      workspaceId: workspace.id,
      // Keep existing workspace data
      name: workspace.name,
      url: workspace.url,
      fiscalYearStart: workspace.fiscalYearStart,
      region: workspace.region,
      // Update avatar fields
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
            variant="outline"
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