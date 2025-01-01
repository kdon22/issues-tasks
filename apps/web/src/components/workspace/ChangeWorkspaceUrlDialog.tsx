'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { type TRPCClientError } from '@trpc/client'
import { type AppRouter } from '@/lib/trpc/routers'

interface ChangeWorkspaceUrlDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
}

export function ChangeWorkspaceUrlDialog({ isOpen, onClose, currentUrl }: ChangeWorkspaceUrlDialogProps) {
  const [newUrl, setNewUrl] = useState(currentUrl)
  const [error, setError] = useState('')

  const updateUrlMutation = trpc.workspace.updateUrl.useMutation({
    onSuccess: (data) => {
      window.location.href = `/${data.url}/settings/workspace/general`
    },
    onError: (error: TRPCClientError<AppRouter>) => setError(error.message),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return
    
    try {
      await updateUrlMutation.mutate({ url: newUrl.trim() })
    } catch (error) {
      console.error('Update URL error:', error)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change workspace URL"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            This will change all your URLs and old ones will be redirected.
          </p>
          <label className="block text-sm font-medium text-gray-700">
            Enter the new workspace URL
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              issuetasks.com/
            </span>
            <Input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="rounded-none rounded-r-md"
              autoFocus
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            URL will be: {newUrl}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateUrlMutation.isLoading || !newUrl.trim() || newUrl === currentUrl}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </form>
    </Dialog>
  )
} 