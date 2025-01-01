'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'

export function WorkspaceSwitcher() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  const { data: currentWorkspace } = trpc.workspace.getCurrent.useQuery()
  const { data: workspaces, isLoading } = trpc.auth.getWorkspaces.useQuery()
  
  const switchMutation = trpc.auth.switchWorkspace.useMutation({
    onSuccess: (data) => {
      if (data.redirectTo) {
        window.location.href = data.redirectTo
      }
    },
    onError: (error) => setError(error.message),
  })

  const createMutation = trpc.workspace.create.useMutation({
    onSuccess: (data) => {
      setIsCreating(false)
      if (data.url) {
        window.location.href = `/${data.url}/my-issues`
      }
    },
    onError: (error) => setError(error.message),
  })

  const handleSwitch = async (workspaceUrl: string) => {
    setError('')
    try {
      await switchMutation.mutate({ workspaceUrl })
    } catch (error) {
      console.error('Switch error:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    
    try {
      await createMutation.mutate({
        name: newWorkspaceName.trim(),
      })
    } catch (error) {
      console.error('Creation error:', error)
    }
  }

  if (isLoading) return null

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <span>{currentWorkspace?.name || 'Select Workspace'}</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
            {/* Current workspace section */}
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">
                CURRENT WORKSPACE
              </div>
              <div className="px-2 py-1 text-sm text-gray-900 font-medium">
                {currentWorkspace?.name}
              </div>
            </div>

            {/* Available workspaces section */}
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">
                AVAILABLE WORKSPACES
              </div>
              {workspaces?.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSwitch(workspace.url)}
                  className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  role="menuitem"
                >
                  {workspace.name}
                </button>
              ))}
            </div>

            {/* Actions section */}
            <div className="p-2">
              <button
                onClick={() => setIsCreating(true)}
                className="block w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded"
              >
                Create new workspace
              </button>
              <button
                onClick={() => router.push('/workspace/join')}
                className="block w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded"
              >
                Join a workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create workspace dialog */}
      <Dialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create a new workspace"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <Input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="My Workspace"
              className="mt-1"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || !newWorkspaceName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  )
} 