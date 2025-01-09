'use client'

import { useState } from 'react'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { api } from '@/lib/trpc/client'
import { Alert } from '@/components/ui/Alert'
import { SingleSelectNoSearch } from '@/components/ui/Dropdowns'
import { Switch } from '@/components/ui/Switch'
import { SettingsCard } from '../SettingsCard'

const homeViewOptions = [
  { label: 'My Issues', value: 'my-issues' },
  { label: 'Active Issues', value: 'active-issues' },
  { label: 'All Issues', value: 'all-issues' }
].map(option => option.label)

const fontSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Default', value: 'default' },
  { label: 'Large', value: 'large' }
].map(option => option.label)

const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
].map(option => option.label)

export function UserPreferences() {
  const { workspace } = useWorkspace()
  const utils = api.useContext()
  const [error, setError] = useState<string | null>(null)

  const { data: preferences, isLoading } = api.preferences.getCurrent.useQuery(undefined, {
    enabled: !!workspace
  })

  const updatePreferences = api.preferences.update.useMutation({
    onSuccess: () => {
      utils.preferences.getCurrent.invalidate()
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  if (!workspace || isLoading) return null

  const getLabelValue = (options: { label: string; value: string }[], label: string) => {
    return options.find(opt => opt.label === label)?.value || ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User Preferences</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your workspace experience
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <SettingsCard 
        title="Display Settings"
        description="Customize how information is displayed"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Home View
            </label>
            <SingleSelectNoSearch
              label="Select default view"
              options={homeViewOptions}
              defaultValue={preferences?.defaultHomeView || 'my-issues'}
              onChange={(value) => {
                updatePreferences.mutate({
                  defaultHomeView: value.toLowerCase().replace(' ', '-')
                })
              }}
              className="w-full max-w-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <SingleSelectNoSearch
              label="Select font size"
              options={fontSizeOptions}
              defaultValue={preferences?.fontSize || 'default'}
              onChange={(value) => {
                updatePreferences.mutate({
                  fontSize: value.toLowerCase()
                })
              }}
              className="w-full max-w-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <SingleSelectNoSearch
              label="Select theme"
              options={themeOptions}
              defaultValue={preferences?.interfaceTheme || 'system'}
              onChange={(value) => {
                updatePreferences.mutate({
                  interfaceTheme: value.toLowerCase()
                })
              }}
              className="w-full max-w-xs"
            />
          </div>

          <div className="flex items-center justify-between max-w-xs">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Use Pointer Cursor
              </label>
              <p className="text-sm text-gray-500">
                Show pointer cursor on interactive elements
              </p>
            </div>
            <Switch
              checked={preferences?.usePointerCursor || false}
              onCheckedChange={(checked) => {
                updatePreferences.mutate({
                  usePointerCursor: checked
                })
              }}
            />
          </div>

          <div className="flex items-center justify-between max-w-xs">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Full Names
              </label>
              <p className="text-sm text-gray-500">
                Show full names instead of usernames
              </p>
            </div>
            <Switch
              checked={preferences?.displayFullNames || false}
              onCheckedChange={(checked) => {
                updatePreferences.mutate({
                  displayFullNames: checked
                })
              }}
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  )
} 