'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/domains/shared/components/Avatar'
import { Popover } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import type { AvatarData } from '@/domains/shared/types/avatar'

interface WorkspaceSelectorProps {
  workspace: {
    id: string
    name: string
    url: string
  }
}

export function WorkspaceSelector({ workspace }: WorkspaceSelectorProps) {
  const router = useRouter()
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()

  const getAvatarData = (name: string, color: string): AvatarData => ({
    type: 'INITIALS',
    name,
    value: name.substring(0, 2).toUpperCase(),
    color
  })

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none">
        <Avatar
          size="sm"
          data={getAvatarData(workspace.name, '#000000')}
        />
        <span className="text-sm font-medium">{workspace.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </Popover.Button>

      <Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {/* Settings */}
          <button
            onClick={() => router.push(`/${workspace.url}/settings/workspace/general`)}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
            <span className="ml-auto text-xs text-gray-500">G then S</span>
          </button>

          {/* Invite Members */}
          <button
            onClick={() => {/* TODO: Open invite dialog */}}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Invite and manage members
          </button>

          {/* Desktop App */}
          <button
            onClick={() => {/* TODO: Download app */}}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Download desktop app
          </button>

          <div className="border-t border-gray-200 my-1" />

          {/* Switch Workspace */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Switch workspace</span>
              <span>O then W</span>
            </div>
            <div className="mt-2 space-y-1">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => router.push(`/${ws.url}`)}
                  className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-gray-100"
                >
                  <Avatar
                    size="sm"
                    data={getAvatarData(ws.name, ws.avatarColor || '#000000')}
                  />
                  <span className="text-sm font-medium text-gray-900">{ws.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 my-1" />

          {/* Log Out */}
          <button
            onClick={() => {/* TODO: Sign out */}}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Log out
            <span className="ml-auto text-xs text-gray-500">⇧ ⌘ Q</span>
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  )
} 