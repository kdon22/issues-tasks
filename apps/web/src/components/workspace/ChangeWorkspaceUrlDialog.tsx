'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { slugify } from '@/lib/utils'

interface ChangeWorkspaceUrlDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
}

export function ChangeWorkspaceUrlDialog({
  isOpen,
  onClose,
  currentUrl,
}: ChangeWorkspaceUrlDialogProps) {
  const [newUrl, setNewUrl] = useState<string>(currentUrl || '')
  const [error, setError] = useState('')

  const utils = trpc.useContext()
  
  const updateMutation = trpc.workspace.updateUrl.useMutation({
    onSuccess: async (data) => {
      // Invalidate queries to refresh data
      await utils.workspace.getCurrent.invalidate()
      await utils.workspace.list.invalidate()
      
      // Redirect to new URL while maintaining the current path
      if (data.url && currentUrl) {
        const newPath = window.location.pathname.replace(currentUrl, data.url)
        window.location.href = newPath
      }
      onClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  // Reset state when dialog opens or currentUrl changes
  useEffect(() => {
    if (isOpen && currentUrl) {
      setNewUrl(currentUrl)
      setError('')
    }
  }, [isOpen, currentUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate input
    if (!newUrl) {
      setError('URL cannot be empty')
      return
    }

    if (newUrl === currentUrl) {
      onClose()
      return
    }

    const slugifiedUrl = slugify(newUrl)
    if (!slugifiedUrl) {
      setError('Please enter a valid URL')
      return
    }

    try {
      await updateMutation.mutate({ url: slugifiedUrl })
    } catch (error) {
      console.error('URL update error:', error)
    }
  }

  const isDisabled = !newUrl || 
    updateMutation.isLoading || 
    newUrl === currentUrl ||
    !slugify(newUrl)

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Change workspace URL"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          This will change all your URLs and old ones will be redirected.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Enter the new workspace URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                issuestasks.com/
              </span>
              <input
                id="url"
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="workspace-name"
              />
            </div>
            {newUrl && (
              <p className="mt-1 text-sm text-gray-500">
                URL will be: {slugify(newUrl)}
              </p>
            )}
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  )
} 