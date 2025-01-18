import { SettingsNavigation } from '@/domains/navigation/components/SettingsNavigation'
import { WORKSPACE_SETTINGS_NAVIGATION, ACCOUNT_SETTINGS_NAVIGATION } from '@/domains/navigation/constants'

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <aside className="w-64 shrink-0 border-r">
        <SettingsNavigation 
          sections={[...WORKSPACE_SETTINGS_NAVIGATION, ...ACCOUNT_SETTINGS_NAVIGATION]}
          className="p-4"
        />
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
} 