'use client'

import { useState } from 'react'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Button } from '@/domains/shared/components/inputs/Button'
import { Dialog } from '@/domains/shared/components/overlays/Dialog'
import { Input } from '@/domains/shared/components/inputs/Input'

interface DeleteTeamSectionProps {
  teamName: string
  onDelete: () => Promise<void>
}

export function DeleteTeamSection({ teamName, onDelete }: DeleteTeamSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (confirmName !== teamName) return
    setIsLoading(true)
    try {
      await onDelete()
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <SettingsCard>
        <SettingsCard.Header>
          <SettingsCard.Title>Delete Team</SettingsCard.Title>
          <SettingsCard.Description>
            Permanently delete this team and all of its data
          </SettingsCard.Description>
        </SettingsCard.Header>
        <SettingsCard.Content>
          <Button 
            variant="destructive"
            onClick={() => setIsOpen(true)}
          >
            Delete Team
          </Button>
        </SettingsCard.Content>
      </SettingsCard>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Delete Team"
        description={
          <>
            This action cannot be undone. Please type <strong>{teamName}</strong> to confirm.
          </>
        }
      >
        <div className="space-y-4">
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={teamName}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== teamName}
              loading={isLoading}
            >
              Delete Team
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
} 