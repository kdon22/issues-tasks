'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/domains/shared/components/inputs'
import { Button } from '@/domains/shared/components/inputs'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { generateSlug } from '@/domains/shared/utils/text'
import { trpc } from '@/infrastructure/trpc/core/client'

export function WorkspaceCreationForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  
  const utils = trpc.useContext()
  const { mutate: createWorkspace, isLoading } = trpc.workspace.create.useMutation({
    onSuccess: (workspace) => {
      utils.workspace.list.invalidate()
      router.push(`/${workspace.url}`)
    },
    onError: () => {
      setError('Failed to create workspace')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Workspace name is required')
      return
    }

    createWorkspace({
      name: name.trim(),
      url: generateSlug(name)
    })
  }

  const slugifiedUrl = name ? generateSlug(name) : ''
  const isDisabled = isLoading || !name.trim()

  return (
    <ErrorBoundary>
      <SettingsCard>
        <SettingsCard.Header>
          <SettingsCard.Title>Create a workspace</SettingsCard.Title>
          <SettingsCard.Description>
            A workspace is where you and your team manage projects and tasks.
          </SettingsCard.Description>
        </SettingsCard.Header>

        <SettingsCard.Content>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Workspace name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error}
                disabled={isDisabled}
                autoFocus
                className="max-w-md"
              />

              {name && (
                <p className="text-sm text-gray-500">
                  Your workspace URL will be:{' '}
                  <span className="font-medium text-gray-900">
                    issuetasks.com/{slugifiedUrl}
                  </span>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isDisabled}
                loading={isLoading}
              >
                Create workspace
              </Button>
            </div>
          </form>
        </SettingsCard.Content>
      </SettingsCard>
    </ErrorBoundary>
  )
} 