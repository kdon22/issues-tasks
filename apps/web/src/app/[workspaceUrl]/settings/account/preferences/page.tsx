'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { Dropdown } from '@/components/ui/Dropdown'
import { Switch } from '@/components/ui/Switch'

export default function PreferencesPage() {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  const { data: workspace } = trpc.workspace.getByUrl.useQuery(
    { url: workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  const { data: preferences, isLoading } = trpc.user.getPreferences.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace }
  )

  const utils = trpc.useContext()
  const updatePreferences = trpc.user.updatePreferences.useMutation({
    onSuccess: (data) => {
      utils.user.getPreferences.setData(
        { workspaceId: workspace?.id ?? '' },
        (old) => ({
          ...old,
          ...data,
        })
      )
    },
  })

  const handleUpdate = (key: string, value: any) => {
    if (!workspace?.id) return

    updatePreferences.mutate({
      workspaceId: workspace.id,
      preferences: { [key]: value }
    })
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-8">Preferences</h1>

      <div className="space-y-12">
        {/* General Section */}
        <section>
          <h2 className="text-lg font-medium mb-6">General</h2>
          
          <div className="space-y-8">
            <div>
              <Dropdown
                label="Default home view"
                value={preferences?.defaultHomeView || 'active-issues'}
                options={[
                  { label: 'Active Issues', value: 'active-issues' },
                  { label: 'My Issues', value: 'my-issues' },
                  { label: 'All Issues', value: 'all-issues' },
                ]}
                onChange={(value) => handleUpdate('defaultHomeView', value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Which view is opened when you open up IssuesTasks
              </p>
            </div>

            <div>
              <Switch
                label="Display full names"
                description="Show full names of users instead of shorter usernames"
                checked={preferences?.displayFullNames || false}
                onChange={(checked) => handleUpdate('displayFullNames', checked)}
              />
            </div>

            <div>
              <Dropdown
                label="First day of the week"
                value={preferences?.firstDayOfWeek || 'Monday'}
                options={[
                  { label: 'Sunday', value: 'Sunday' },
                  { label: 'Monday', value: 'Monday' },
                ]}
                onChange={(value) => handleUpdate('firstDayOfWeek', value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Used for date pickers
              </p>
            </div>

            <div>
              <Switch
                label="Convert text emoticons into emojis"
                description="Strings like :) will be converted to 😊"
                checked={preferences?.useEmoticons || false}
                onChange={(checked) => handleUpdate('useEmoticons', checked)}
              />
            </div>
          </div>
        </section>

        {/* Interface and theme */}
        <section>
          <h2 className="text-lg font-medium mb-6">Interface and theme</h2>
          
          <div className="space-y-8">
            <div>
              <Dropdown
                label="Font size"
                value={preferences?.fontSize || 'default'}
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Default', value: 'default' },
                  { label: 'Large', value: 'large' },
                ]}
                onChange={(value) => handleUpdate('fontSize', value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                Adjust the size of text across the app
              </p>
            </div>

            <div>
              <Switch
                label="Use pointer cursors"
                description="Change the cursor to a pointer when hovering over any interactive element"
                checked={preferences?.usePointerCursor || false}
                onChange={(checked) => handleUpdate('usePointerCursor', checked)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 