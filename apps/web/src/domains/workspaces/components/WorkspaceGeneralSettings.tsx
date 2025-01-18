'use client'

import { Input } from '@/domains/shared/components/inputs'
import { AvatarPicker } from '@/domains/shared/components/Avatar'
import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { useDebouncedCallback } from 'use-debounce'
import { useWorkspaceMutations } from '../hooks/useWorkspaceMutations'
import { useAvatar } from '@/domains/shared/hooks/useAvatar'
import type { HasAvatar } from '@/domains/shared/types/avatar'

interface GeneralSettingsProps {
  workspace: {
    id: string
    name: string
    url: string
  } & HasAvatar
}

export function GeneralSettings({ workspace }: GeneralSettingsProps) {
  const { avatarData, isUpdating, updateAvatar } = useAvatar(workspace, 'workspace')
  
  const { updateName, updateUrl, isLoading } = useWorkspaceMutations(workspace.id)

  const debouncedUpdateName = useDebouncedCallback(updateName, 500)
  const debouncedUpdateUrl = useDebouncedCallback(updateUrl, 500)

  return (
    <SettingsCard>
      <SettingsCard.Content>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <AvatarPicker
              data={avatarData}
              onChange={updateAvatar}
              disabled={isLoading || isUpdating}
            />
            <Input
              label="Workspace Name"
              defaultValue={workspace.name}
              onChange={(e) => debouncedUpdateName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Input
            label="Workspace URL"
            defaultValue={workspace.url}
            onChange={(e) => debouncedUpdateUrl(e.target.value)}
            helperText="This is your workspace's unique URL"
            disabled={isLoading}
          />
        </div>
      </SettingsCard.Content>
    </SettingsCard>
  )
} 