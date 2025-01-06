'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { Alert } from '@/components/ui/Alert'
import { api } from '@/lib/trpc/client'
import type { AvatarData } from '@/lib/types/avatar'
import { Avatar } from '@/components/ui/Avatar'

export default function WorkspaceGeneralSettings() {
  const { workspace } = useWorkspace()
  const utils = api.useContext()
  
  if (!workspace) return null

  const updateWorkspace = api.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate()
    }
  })

  const avatarData: AvatarData = {
    type: workspace.avatarType,
    icon: workspace.avatarIcon || undefined,
    color: workspace.avatarColor || 'bg-blue-500',
    emoji: workspace.avatarEmoji || undefined,
    imageUrl: workspace.avatarImageUrl || undefined,
    name: workspace.name
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-8">Workspace Settings</h1>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-medium mb-4">Workspace Avatar</h2>
        
        {updateWorkspace.error && (
          <Alert variant="error" className="mb-4">
            Failed to update avatar
          </Alert>
        )}
        
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

          <div>
            <h3 className="text-lg font-medium">{workspace.name}</h3>
            <p className="text-sm text-gray-500">
              {updateWorkspace.isLoading ? 'Updating...' : 'Update your workspace avatar'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 