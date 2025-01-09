'use client'

import { SettingsNav } from './SettingsNav'
import { SettingsContainer } from './SettingsContainer'

export function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 p-8 border-r border-gray-200 bg-white">
        <SettingsNav />
      </div>
      <main className="flex-1 flex justify-center">
        <SettingsContainer>
          {children}
        </SettingsContainer>
      </main>
    </div>
  )
} 