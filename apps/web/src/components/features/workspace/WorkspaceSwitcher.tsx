'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { Dropdown } from '@/components/ui/Dropdown'
import { api } from '@/lib/trpc/client'
import { type AvatarData } from '@/lib/types/avatar'
import { Avatar } from '@/components/ui/Avatar'

interface WorkspaceData {
  id: string
  name: string
  url: string
}

const getAvatarData = (workspace: any): AvatarData => {
  switch (workspace.avatarType) {
    case 'INITIALS':
      return { type: 'INITIALS', name: workspace.name, color: workspace.avatarColor || null }
    case 'ICON':
      return { type: 'ICON', name: workspace.name, icon: workspace.avatarIcon || null, color: workspace.avatarColor || null }
    case 'EMOJI':
      return { type: 'EMOJI', name: workspace.name, emoji: workspace.avatarEmoji || null }
    case 'IMAGE':
      return { type: 'IMAGE', name: workspace.name, imageUrl: workspace.avatarImageUrl || null }
    default:
      return { type: 'INITIALS', name: workspace.name, color: null }
  }
}

export function WorkspaceSwitcher() {
  const { workspace } = useWorkspace()
  const { data: workspaces } = api.workspace.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  })

  if (!workspace) return null

  return (
    <Dropdown
      value={workspace.url}
      onChange={(url) => {
        window.location.href = `/${url}/my-issues`
      }}
      options={workspaces?.map((ws: WorkspaceData) => ({
        value: ws.url,
        label: ws.name
      })) || []}
    >
      <Avatar
        data={getAvatarData(workspace)}
        size="md"
      />
    </Dropdown>
  )
} 