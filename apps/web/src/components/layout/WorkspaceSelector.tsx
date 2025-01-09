'use client'

import { Avatar } from '@/components/ui/Avatar'
import { toAvatarData } from '@/lib/types/avatar'
import type { Workspace } from '@/lib/types/workspace'

export function WorkspaceSelector({ workspace }: { workspace: Workspace }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar 
        data={toAvatarData({ ...workspace, name: workspace.name })}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{workspace.name}</div>
      </div>
    </div>
  )
} 