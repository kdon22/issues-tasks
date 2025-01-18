'use client'

import { AvatarPicker } from '@/domains/shared/components/Avatar'
import { Input } from '@/domains/shared/components/inputs'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'
import type { Team } from '../types'

interface TeamGeneralSettingsProps {
  team: Team
  onUpdate: (data: Partial<Team>) => Promise<void>
  onDelete: () => Promise<void>
}

export function TeamGeneralSettings({ team, onUpdate, onDelete }: TeamGeneralSettingsProps) {
  const { avatarData, isUpdating, updateAvatar } = useAvatar(team, 'team')

  return (
    <SettingsCard>
      <SettingsCard.Header>
        <SettingsCard.Title>Team Settings</SettingsCard.Title>
        <SettingsCard.Description>
          Manage your team's basic information
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
              label="Team Name"
              value={team.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>

          <Input
            label="Team Identifier"
            value={team.identifier}
            onChange={(e) => onUpdate({ identifier: e.target.value.toUpperCase() })}
            maxLength={6}
            pattern="[A-Z0-9]+"
            className="uppercase"
            helperText="Max 6 characters. Used as prefix for issues (e.g. KD-1)"
          />
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