'use client'

import { api } from '@/lib/trpc/client'
import { Avatar } from '@/components/ui/Avatar'
import { type AvatarData } from '@/lib/types/avatar'
import { type AvatarType } from '@/lib/types/avatar'
import { useWorkspace } from '@/lib/hooks/useWorkspace'

interface WorkspaceItem {
  id: string
  name: string
  url: string
  avatarType: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
}

export function WorkspaceSelector() {
  const { workspace } = useWorkspace()
  const { data: workspaces } = api.workspace.list.useQuery()

  if (!workspace) return null

  return (
    <Avatar
      data={{
        type: workspace.avatarType,
        icon: workspace.avatarIcon || undefined,
        color: workspace.avatarColor || 'bg-blue-500',
        emoji: workspace.avatarEmoji || undefined,
        imageUrl: workspace.avatarImageUrl || undefined,
        name: workspace.name
      }}
      size="sm"
    />
  )
} 