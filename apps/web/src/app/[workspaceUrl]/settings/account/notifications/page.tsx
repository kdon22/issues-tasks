'use client'

import { useParams } from 'next/navigation'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { NotificationSettings } from '@/domains/users/components/NotificationSettings'
import { trpc } from '@/infrastructure/trpc/core/client'
import type { NotificationSettings as NotificationSettingsType } from '@/domains/users/types/notifications'

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

export default function Page() {
  const params = useParams<{ workspaceUrl: string }>()
  const utils = trpc.useContext()
  
  const { data: user, isLoading } = trpc.user.get.useQuery({ id: 'me' })
  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess: () => utils.user.get.invalidate()
  })

  if (isLoading || !user) return null

  const settings = user.notificationSettings || defaultSettings

  return (
    <div className="flex-1">
      <SettingsHeader
        title="Notification Settings"
        description="Manage your notification preferences"
      />
      <div className="p-8">
        <NotificationSettings 
          settings={settings}
          onUpdate={(updates) => {
            updateUser({
              id: user.id,
              notificationSettings: updates
            })
          }}
        />
      </div>
    </div>
  )
} 