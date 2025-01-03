'use client'

import { api } from '@/lib/trpc/client'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { Switch } from '@/components/ui/Switch'
import { Dropdown } from '@/components/ui/Dropdown'
import { usePathname } from 'next/navigation'

export default function PreferencesPage() {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]
  const { workspace } = useWorkspace(workspaceUrl)
  const utils = api.useContext()
  
  const { data: preferences, isLoading } = api.user.getPreferences.useQuery(
    { workspaceId: workspace?.id || '' },
    { enabled: !!workspace?.id }
  )

  const updatePreferences = api.user.updatePreferences.useMutation({
    onSuccess: () => {
      utils.user.getPreferences.invalidate()
    }
  })

  if (isLoading) {
    return <div>Loading preferences...</div>
  }

  if (!preferences) {
    return <div>Error loading preferences</div>
  }

  const handlePreferenceChange = (key: string, value: any) => {
    if (!workspace?.id) return

    updatePreferences.mutate({
      workspaceId: workspace.id,
      [key]: value
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-medium mb-4">General</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Default home view</label>
                <Dropdown
                  value={preferences.defaultHomeView}
                  onChange={(value) => handlePreferenceChange('defaultHomeView', value)}
                  options={[
                    { label: 'My Issues', value: 'my-issues' },
                    { label: 'Active Issues', value: 'active-issues' },
                    { label: 'Recently Updated', value: 'recently-updated' }
                  ]}
                  className="w-48"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Which view is opened when you open up IssuesTasks
                </p>
              </div>

              <Switch
                checked={preferences.displayFullNames}
                onChange={(checked) => handlePreferenceChange('displayFullNames', checked)}
                label="Display full names"
                description="Show full names of users instead of shorter usernames"
              />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-4">Interface and theme</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Font size</label>
                <Dropdown
                  value={preferences.fontSize}
                  onChange={(value) => handlePreferenceChange('fontSize', value)}
                  options={[
                    { label: 'Default', value: 'default' },
                    { label: 'Large', value: 'large' },
                    { label: 'Extra Large', value: 'xlarge' }
                  ]}
                  className="w-48"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 