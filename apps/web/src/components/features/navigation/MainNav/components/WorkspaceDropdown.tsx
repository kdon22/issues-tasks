'use client'

import { Avatar } from '@/components/ui/Avatar'
import { Check, Plus, Settings, Users, LogOut } from 'lucide-react'
import Link from 'next/link'
import type { Workspace } from '@prisma/client'
import { toAvatarData } from '@/lib/types/avatar'

interface WorkspaceDropdownProps {
  currentWorkspace: Workspace
  workspaces: Workspace[]
  onClose: () => void
  onSwitchWorkspace: (workspace: Workspace) => void
  onLogout: () => void
}

export function WorkspaceDropdown({
  currentWorkspace,
  workspaces = [],
  onClose,
  onSwitchWorkspace,
  onLogout
}: WorkspaceDropdownProps) {
  const sortedWorkspaces = [...(workspaces || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  return (
    <div className="absolute top-full left-0 w-64 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Current Workspace */}
      <div className="p-2 border-b">
        <div className="flex items-center gap-2 p-2 rounded-md">
          <Avatar 
            data={toAvatarData(currentWorkspace)} 
            size="sm" 
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{currentWorkspace.name}</div>
          </div>
          <Check size={16} className="text-blue-600 flex-shrink-0" />
        </div>
      </div>

      {/* Other Workspaces */}
      <div className="py-1 border-b">
        {sortedWorkspaces.map(workspace => (
          workspace.id !== currentWorkspace.id && (
            <button
              key={workspace.id}
              onClick={() => {
                onSwitchWorkspace(workspace)
                onClose()
              }}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-50"
            >
              <Avatar 
                data={toAvatarData(workspace)} 
                size="sm" 
              />
              <span className="text-sm truncate">{workspace.name}</span>
            </button>
          )
        ))}
      </div>

      {/* Actions */}
      <div className="py-1">
        <Link
          href="/workspace/new"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          <Plus size={16} />
          <span>Create new workspace</span>
        </Link>

        <Link
          href={`/${currentWorkspace.url}/settings/workspace/general`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>

        <Link
          href={`/${currentWorkspace.url}/settings/workspace/members`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          <Users size={16} />
          <span>Invite and manage members</span>
        </Link>

        <div className="border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
} 