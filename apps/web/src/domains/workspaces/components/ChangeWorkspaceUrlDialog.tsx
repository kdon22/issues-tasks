'use client'

import { useState } from 'react'
import { Dialog } from '@/domains/shared/components/overlays/Dialog'
import { Input } from '@/domains/shared/components/inputs'
import { trpc } from '@/infrastructure/trpc/core/client'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
  workspaceId: string
}

export function ChangeWorkspaceUrlDialog({ isOpen, onClose, currentUrl, workspaceId }: Props) {
  const [newUrl, setNewUrl] = useState(currentUrl)
  const [error, setError] = useState('')
  
  const utils = trpc.useContext()
  const { mutate: updateWorkspace, isLoading } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate()
      onClose()
    },
    onError: () => {
      setError('Failed to update workspace URL')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newUrl.trim()) {
      setError('URL is required')
      return
    }

    updateWorkspace({
      id: workspaceId,
      url: newUrl.trim()
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change Workspace URL"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="New URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          error={error}
          disabled={isLoading}
          autoFocus
        />
        {/* ... rest of dialog content */}
      </form>
    </Dialog>
  )
} 