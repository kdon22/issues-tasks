'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { NotificationSettings } from '../types'

export function useNotificationSettings() {
  const utils = trpc.useContext()
  
  const { data: settings, isLoading } = trpc.user.getNotificationSettings.useQuery()
  
  const { mutate: updateSettings } = trpc.user.updateNotificationSettings.useMutation({
    onSuccess: () => {
      utils.user.getNotificationSettings.invalidate()
    }
  })

  const defaultSettings: NotificationSettings = {
    email: {
      marketing: false,
      updates: false,
      teamActivity: false
    },
    web: {
      teamActivity: false,
      mentions: false
    }
  }

  return {
    settings: settings ?? defaultSettings,
    isLoading,
    updateSettings
  }
} 