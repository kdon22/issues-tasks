'use client'

import { Switch } from '@/domains/shared/components/inputs'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { useTeamPermissions } from '../hooks/useTeamPermissions'
import type { TeamSettings } from '../types'

interface TeamPermissionsProps {
  teamId: string
}

export function TeamPermissions({ teamId }: TeamPermissionsProps) {
  const { 
    permissions,
    isLoading,
    updatePermission
  } = useTeamPermissions(teamId)

  if (isLoading) return null

  const permissionSettings: Array<{
    key: keyof TeamSettings
    label: string
    description: string
  }> = [
    {
      key: 'allowMemberInvites',
      label: 'Allow Member Invites',
      description: 'Let team members invite others'
    },
    {
      key: 'requireAdminApproval',
      label: 'Require Admin Approval',
      description: 'New members need admin approval to join'
    }
  ]

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Team Permissions</SettingsCard.Title>
        <SettingsCard.Description>
          Configure who can do what in your team
        </SettingsCard.Description>
      </SettingsCard.Header>

      <SettingsCard.Content>
        <div className="space-y-6">
          {permissionSettings.map(({ key, label, description }) => (
            <Switch
              key={key}
              label={label}
              description={description}
              checked={permissions[key]}
              onChange={(checked) => updatePermission(key, checked)}
            />
          ))}
        </div>
      </SettingsCard.Content>
    </SettingsCard>
  )
} 