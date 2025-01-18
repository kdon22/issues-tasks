'use client'

import { SettingsNav } from './components/SettingsNav'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex w-full">
      <div className="w-60 border-r border-gray-200 p-6">
        <SettingsNav />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 