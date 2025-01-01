'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { ChangeWorkspaceUrlDialog } from './ChangeWorkspaceUrlDialog'
import { useParams } from 'next/navigation'

export function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string
  
  const utils = trpc.useContext()
  const { data: workspace } = trpc.workspace.getByUrl.useQuery({ 
    url: workspaceUrl
  }, {
    enabled: !!workspaceUrl,
  })

  const { mutate: updateWorkspace } = trpc.workspace.updateWorkspace.useMutation({
    onSuccess: () => {
      utils.workspace.getByUrl.invalidate()
    },
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string

    try {
      await updateWorkspace({ name })
    } finally {
      setIsLoading(false)
    }
  }

  if (!workspace) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <Input
          label="Workspace Name"
          name="name"
          defaultValue={workspace.name || ''}
          placeholder="My Workspace"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Workspace URL
          </label>
          <button
            type="button"
            onClick={() => setIsUrlDialogOpen(true)}
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span>issuestasks.com/{workspace.url}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </form>

      {workspace && (
        <ChangeWorkspaceUrlDialog
          isOpen={isUrlDialogOpen}
          onClose={() => setIsUrlDialogOpen(false)}
          currentUrl={workspace.url}
        />
      )}
    </div>
  )
} 