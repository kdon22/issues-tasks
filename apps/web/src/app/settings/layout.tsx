import { type PropsWithChildren } from 'react'
import { SettingsSidebar } from '@/components/ui/SettingsSidebar'

export default function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SettingsSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 