'use client'

import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { PreferencesSettings } from '@/domains/users/components/PreferencesSettings'

export default function Page() {
  return (
    <div className="flex-1">
      <SettingsHeader
        title="Account Preferences"
        description="Customize your account settings"
      />
      <div className="p-8">
        <PreferencesSettings />
      </div>
    </div>
  )
} 