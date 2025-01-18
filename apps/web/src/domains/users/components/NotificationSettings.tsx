'use client'

import { Switch } from '@/domains/shared/components/inputs'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'

interface NotificationSettings {
  email: {
    marketing: boolean
    updates: boolean
    teamActivity: boolean
  }
  web: {
    teamActivity: boolean
    mentions: boolean
  }
}

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

interface Props {
  settings?: Partial<NotificationSettings>
  onUpdate: (settings: NotificationSettings) => void
}

export function NotificationSettings({ settings = defaultSettings, onUpdate }: Props) {
  const currentSettings = {
    email: {
      ...defaultSettings.email,
      ...settings?.email
    },
    web: {
      ...defaultSettings.web,
      ...settings?.web
    }
  }

  const emailSettings = [
    {
      key: 'marketing' as const,
      label: 'Marketing Emails',
      description: 'Receive emails about new features and updates'
    },
    {
      key: 'updates' as const,
      label: 'Product Updates',
      description: 'Get notified about product updates'
    },
    {
      key: 'teamActivity' as const,
      label: 'Team Activity',
      description: 'Get notified about team activity'
    }
  ]

  const webSettings = [
    {
      key: 'teamActivity' as const,
      label: 'Team Activity',
      description: 'Show notifications for team activity'
    },
    {
      key: 'mentions' as const,
      label: 'Mentions',
      description: 'Get notified when you are mentioned'
    }
  ]

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Notification Settings</SettingsCard.Title>
        <SettingsCard.Description>
          Manage how you receive notifications
        </SettingsCard.Description>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Email Notifications</h3>
            <div className="space-y-4">
              {emailSettings.map(({ key, label, description }) => (
                <Switch
                  key={key}
                  checked={currentSettings.email[key]}
                  onChange={(checked) => onUpdate({
                    ...currentSettings,
                    email: { ...currentSettings.email, [key]: checked }
                  })}
                  label={label}
                  description={description}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Web Notifications</h3>
            <div className="space-y-4">
              {webSettings.map(({ key, label, description }) => (
                <Switch
                  key={key}
                  checked={currentSettings.web[key]}
                  onChange={(checked) => onUpdate({
                    ...currentSettings,
                    web: { ...currentSettings.web, [key]: checked }
                  })}
                  label={label}
                  description={description}
                />
              ))}
            </div>
          </div>
        </div>
      </SettingsCard.Content>
    </SettingsCard>
  )
} 