'use client'

import { Select, Switch } from '@/domains/shared/components/inputs'
import { 
  HomeView, 
  FontSize, 
  Theme,
  type UserPreferences 
} from '@/domains/shared/constants/preferences'
import { trpc } from '@/infrastructure/trpc/core/client'

export function PreferencesSettings() {
  const utils = trpc.useContext()
  const { data: user } = trpc.user.get.useQuery({ id: 'me' })
  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess: () => utils.user.get.invalidate()
  })

  if (!user) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <Select
            label="Default Home View"
            value={user.preferences?.defaultHomeView || ''}
            options={[
              { value: HomeView.Inbox, label: 'Inbox' },
              { value: HomeView.MyIssues, label: 'My Issues' },
              { value: HomeView.ActiveIssues, label: 'Active Issues' },
              { value: HomeView.AllIssues, label: 'All Issues' }
            ]}
            multiple={false}
            onChange={(value) => updateUser({
              id: user.id,
              preferences: { defaultHomeView: value as string, workspaceId: user.preferences?.workspaceId || '' }
            })}
          />

          <Select
            label="Font Size"
            value={user.preferences?.fontSize || ''}
            options={[
              { value: FontSize.Small, label: 'Small' },
              { value: FontSize.Default, label: 'Default' },
              { value: FontSize.Large, label: 'Large' }
            ]}
            multiple={false}
            onChange={(value) => updateUser({
              id: user.id,
              preferences: { fontSize: value as string, workspaceId: user.preferences?.workspaceId || '' }
            })}
          />

          <Select
            label="Interface Theme"
            value={user.preferences?.interfaceTheme || ''}
            options={[
              { value: Theme.System, label: 'System' },
              { value: Theme.Light, label: 'Light' },
              { value: Theme.Dark, label: 'Dark' }
            ]}
            multiple={false}
            onChange={(value) => updateUser({
              id: user.id,
              preferences: { interfaceTheme: value as string, workspaceId: user.preferences?.workspaceId || '' }
            })}
          />

          <Switch
            checked={user.preferences?.displayFullNames || false}
            label="Display Full Names"
            onChange={checked => updateUser({
              id: user.id,
              preferences: { displayFullNames: checked, workspaceId: user.preferences?.workspaceId || '' }
            })}
            description="Show full names instead of usernames"
          />
        </div>
      </div>
    </div>
  )
} 