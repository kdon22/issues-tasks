'use client'

import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Input, Button } from '@/domains/shared/components/inputs'
import { useState } from 'react'
import { trpc } from '@/infrastructure/trpc/core/client'

interface Props {
  userId: string
}

export function SecuritySettings({ userId }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { mutate: updatePassword, isLoading } = trpc.user.updatePassword.useMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      // Show error
      return
    }

    updatePassword({
      userId,
      currentPassword,
      newPassword
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          Update Password
        </Button>
      </form>
    </div>
  )
} 