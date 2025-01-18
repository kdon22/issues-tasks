'use client'

import { useState } from 'react'
import { Dialog } from '@/domains/shared/components/overlays/Dialog'
import { Input } from '@/domains/shared/components/inputs/Input'
import { Select } from '@/domains/shared/components/inputs/Select'
import { Button } from '@/domains/shared/components/inputs/Button'

type TeamRole = 'ADMIN' | 'MEMBER'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: TeamRole) => Promise<void>
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('MEMBER')
  const [isLoading, setIsLoading] = useState(false)

  const roleOptions = [
    { value: 'MEMBER', label: 'Member' },
    { value: 'ADMIN', label: 'Admin' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onInvite(email, role)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label="Role"
          value={role}
          onChange={(value) => setRole(value as TeamRole)}
          options={roleOptions}
          placeholder="Select a role"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Send Invite
          </Button>
        </div>
      </form>
    </Dialog>
  )
} 