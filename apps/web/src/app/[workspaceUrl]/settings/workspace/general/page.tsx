'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { EntityAvatar } from '@/components/ui/EntityAvatar'
import { IconPicker } from '@/components/ui/IconPicker'
import { api } from '@/lib/trpc/client'
import { usePathname } from 'next/navigation'

export default function WorkspaceGeneralSettings() {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]
  const { workspace } = useWorkspace(workspaceUrl)
  const utils = api.useContext()

  const updateAvatar = api.workspace.updateAvatar.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate()
    }
  })

  if (!workspace) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <IconPicker
          type={workspace.avatarType.toLowerCase() as "icon" | "emoji" | "initials" | "image"}
          icon={workspace.avatarIcon}
          color={workspace.avatarColor}
          onChange={(avatar) => updateAvatar.mutate({
            id: workspace.id,
            avatarType: avatar.type.toUpperCase() as "INITIALS" | "ICON" | "EMOJI" | "IMAGE",
            avatarIcon: avatar.icon,
            avatarColor: avatar.color,
            avatarEmoji: avatar.emoji,
            avatarImageUrl: avatar.imageUrl
          })}
        >
          <EntityAvatar type="workspace" id={workspace.id} size="lg" />
        </IconPicker>
        
        <div>
          <h3 className="text-lg font-medium">{workspace.name}</h3>
          <p className="text-sm text-gray-500">
            Update your workspace avatar
          </p>
        </div>
      </div>
      
      {/* Other workspace settings... */}
    </div>
  )
} 