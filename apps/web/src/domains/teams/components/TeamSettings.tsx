'use client'

import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Switch } from '@/domains/shared/components/inputs'
import { useTeamSettings } from '../hooks/useTeamSettings'
import type { Team, TeamSettings } from '../types'

interface TeamSettingsProps {
  team: Team
  onUpdate: (settings: TeamSettings) => Promise<void>
  onDelete: () => Promise<void>
}

export function TeamSettings({ team, onUpdate, onDelete }: TeamSettingsProps) {
  const { 
    settings,
    isLoading,
    updateSettings
  } = useTeamSettings(team.id)

  if (isLoading) return null

  const settingsConfig: Array<{
    key: keyof TeamSettings
    label: string
    description: string
    defaultValue: boolean
  }> = [
    {
      key: 'isPrivate',
      label: 'Private Team',
      description: 'Only team members can view team details',
      defaultValue: false
    },
    {
      key: 'allowMemberInvites',
      label: 'Member Invites',
      description: 'Allow team members to invite others',
      defaultValue: true
    },
    {
      key: 'requireAdminApproval',
      label: 'Admin Approval',
      description: 'Require admin approval for new members',
      defaultValue: false
    }
  ]

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Team Settings</SettingsCard.Title>
        <SettingsCard.Description>
          Configure team settings and privacy
        </SettingsCard.Description>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-4">
          {settingsConfig.map(({ key, label, description, defaultValue }) => (
            <Switch
              key={key}
              checked={settings?.[key] ?? defaultValue}
              onChange={(checked) => updateSettings({
                isPrivate: settings?.isPrivate ?? false,
                allowMemberInvites: settings?.allowMemberInvites ?? true,
                requireAdminApproval: settings?.requireAdminApproval ?? false,
                [key]: checked
              })}
              label={label}
              description={description}
            />
          ))}
        </div>
      </SettingsCard.Content>

      <SettingsCard.Footer>
        <SettingsCard.DeleteSection
          title="Delete Team"
          description="This action cannot be undone. All team data will be permanently deleted."
          onDelete={onDelete}
        />
      </SettingsCard.Footer>
    </SettingsCard>
  )
}