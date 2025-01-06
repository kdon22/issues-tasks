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
        data={{
          type: workspace.avatarType,
          icon: workspace.avatarIcon || undefined,
          color: workspace.avatarColor || 'bg-blue-500',
          emoji: workspace.avatarEmoji || undefined,
          imageUrl: workspace.avatarImageUrl || undefined,
          name: workspace.name
        }}
        size="md"
      />
    </Dropdown>
  )
} 