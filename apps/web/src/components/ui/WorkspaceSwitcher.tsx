'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { ChevronDown, Settings, Users, LogOut, Plus } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  url: string
}

export function WorkspaceSwitcher() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: workspaces } = api.workspace.list.useQuery()
  const currentWorkspace = workspaces?.[0]

  if (!currentWorkspace) return null

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-lg font-semibold hover:bg-gray-100 rounded-md"
      >
        <div className="flex items-center gap-2">
          <span className="bg-yellow-100 text-yellow-800 w-8 h-8 rounded-full flex items-center justify-center">
            {currentWorkspace.name.charAt(0)}
          </span>
          <span>{currentWorkspace.name}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-gray-900">Workspaces</div>
            {workspaces?.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  router.push(`/${workspace.url}/my-issues`)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                <span className="bg-yellow-100 text-yellow-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                  {workspace.name.charAt(0)}
                </span>
                {workspace.name}
              </button>
            ))}
            
            <div className="border-t mt-2">
              <button
                onClick={() => {
                  router.push(`/${currentWorkspace.url}/settings`)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button
                onClick={() => {
                  router.push(`/${currentWorkspace.url}/settings/members`)
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                <Users className="w-4 h-4" />
                Invite and manage members
              </button>
            </div>

            <div className="border-t">
              <button
                onClick={() => {
                  router.push('/workspace/new')
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                Create or join a workspace
              </button>
            </div>

            <div className="border-t">
              <button
                onClick={() => {
                  // TODO: Add logout functionality
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 