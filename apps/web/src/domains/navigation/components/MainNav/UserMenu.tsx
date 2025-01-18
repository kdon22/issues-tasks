'use client'

import { Avatar } from '@/domains/shared/components/Avatar'
import { Check, Plus, Settings, Users, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { trpc } from '@/infrastructure/trpc/core/client'
import { getAvatarString } from '@/domains/shared/utils/getAvatarString'

export function UserMenu() {
  const router = useRouter()
  const { data: session } = useSession()
  const utils = trpc.useContext()

  const { data: currentWorkspace } = trpc.workspace.getCurrent.useQuery()
  const { data: workspaces } = trpc.workspace.list.useQuery()

  const currentAvatarData = currentWorkspace ? {
    type: 'INITIALS' as const,
    name: currentWorkspace.name,
    value: getAvatarString(currentWorkspace),
    color: currentWorkspace.avatarColor || '#000000'
  } : {
    type: 'INITIALS' as const,
    name: '',
    value: '',
    color: '#000000'
  }

  const sortedWorkspaces = [...(workspaces || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  if (!currentWorkspace || !session) return null

  const handleWorkspaceSwitch = async (url: string) => {
    await utils.workspace.invalidate()
    router.push(`/${url}`)
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
        <Avatar 
          data={currentAvatarData}
          size="sm" 
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{currentWorkspace.name}</div>
        </div>
        <Check size={16} className="text-blue-600 flex-shrink-0" />
      </button>

      <div className="hidden group-hover:block absolute top-full left-0 w-64 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        {/* Other Workspaces */}
        <div className="py-1 border-b">
          {sortedWorkspaces.map(workspace => {
            return (
              workspace.id !== currentWorkspace.id && (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSwitch(workspace.url)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-50"
                >
                  <Avatar 
                    data={{
                      type: 'INITIALS' as const,
                      name: workspace.name,
                      value: getAvatarString(workspace),
                      color: workspace.avatarColor || '#000000'
                    }}
                    size="sm" 
                  />
                  <span className="text-sm truncate">{workspace.name}</span>
                </button>
              )
            )
          })}
        </div>

        {/* Actions */}
        <div className="py-1">
          <Link
            href="/workspace/new"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            <span>Create new workspace</span>
          </Link>

          <Link
            href={`/${currentWorkspace.url}/settings/workspace/general`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>

          <Link
            href={`/${currentWorkspace.url}/settings/workspace/members`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Users size={16} />
            <span>Invite and manage members</span>
          </Link>

          <div className="border-t">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 