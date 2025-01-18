'use client'

import { useProfileSettings } from '../hooks/useProfileSettings'
import { Input } from '@/domains/shared/components/inputs'
import { AvatarPicker } from '@/domains/shared/components/Avatar'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'

interface Props {
  userId: string
}

export function ProfileSettings({ userId }: Props) {
  const { profile, isLoading, updateProfile } = useProfileSettings({ userId })
  const { avatarData, isUpdating, updateAvatar } = useAvatar(
    profile || {
      id: userId,
      name: '',
      avatarType: 'INITIALS',
      avatarColor: null,
      avatarIcon: null,
      avatarEmoji: null,
      avatarImageUrl: null
    }, 
    'user'
  )

  if (isLoading || !profile) return <div>Loading...</div>

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Profile Settings</SettingsCard.Title>
        <SettingsCard.Description>
          Manage your profile information
        </SettingsCard.Description>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <AvatarPicker
              data={avatarData}
              onChange={updateAvatar}
              disabled={isUpdating}
            />
            <Input
              label="Name"
              value={profile.name || ''}
              onChange={(e) => updateProfile({ 
                id: userId,
                name: e.target.value 
              })}
            />
          </div>

          <Input
            label="Email"
            value={profile.email}
            disabled
          />
        </div>
      </SettingsCard.Content>
    </SettingsCard>
  )
} 