'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import { useState } from 'react'

interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useSecuritySettings({ userId }: { userId: string }) {
  const utils = trpc.useContext()
  const [isLoading, setIsLoading] = useState(false)

  const { mutate: updatePassword } = trpc.user.updatePassword.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => {
      utils.user.get.invalidate({ id: userId })
    }
  })

  const handleUpdatePassword = async (data: SecuritySettings) => {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    updatePassword({
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  return {
    isLoading,
    updatePassword: handleUpdatePassword
  }
} 