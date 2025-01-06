'use client'

import { Settings, Users, LogOut, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { WorkspaceDropdownProps, WorkspaceItem } from './types'
import { getInitials } from '@/lib/utils'

const WorkspaceButton = ({
  workspace,
  isActive,
  onClick
}: {
  workspace: WorkspaceItem
  isActive?: boolean
  onClick: () => void
}) => (
  <button 
    onClick={onClick}
    className={`w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3 ${
      isActive ? 'bg-orange-50 border-l-2 border-orange-500' : ''
    }`}
  >
    <div className={`w-8 h-8 bg-gradient-to-br from-${workspace.color.from} to-${workspace.color.to} rounded-lg flex items-center justify-center shadow-sm`}>
      <span className="text-white font-medium">{getInitials(workspace.name)}</span>
    </div>
    <div className="flex flex-col items-start flex-1">
      <span className="font-medium">{workspace.name}</span>
      <span className="text-xs text-gray-500">{workspace.url}.issuetasks.com</span>
    </div>
    {isActive && <Check size={16} className="text-orange-500" />}
  </button>
)

export function WorkspaceDropdown({
  currentWorkspace,
  workspaces,
  onClose,
  onSwitchWorkspace
}: WorkspaceDropdownProps) {
  const router = useRouter()

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-10"
        onClick={onClose}
      />
      <div className="absolute top-full left-0 w-72 bg-white border border-gray-200 shadow-lg rounded-lg mt-1 py-2 z-50">
        {workspaces.map((workspace) => (
          <WorkspaceButton
            key={workspace.id}
            workspace={workspace}
            isActive={workspace.id === currentWorkspace.id}
            onClick={() => {
              onSwitchWorkspace(workspace.url)
              onClose()
            }}
          />
        ))}

        <div className="border-t border-gray-200 mt-2 pt-2">
          <button 
            onClick={() => {
              router.push(`/${currentWorkspace.url}/settings/workspace/general`)
              onClose()
            }}
            className="w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
          >
            <Settings size={16} className="text-gray-600" />
            <span>Settings</span>
            <span className="ml-auto text-xs text-gray-400">G then S</span>
          </button>
          
          <button 
            onClick={() => {
              router.push(`/${currentWorkspace.url}/settings/workspace/members`)
              onClose()
            }}
            className="w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
          >
            <Users size={16} className="text-gray-600" />
            <span>Invite and manage members</span>
          </button>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <LogOut size={16} className="text-red-600" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  )
} 