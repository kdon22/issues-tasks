'use client'

import { WorkspaceSettings } from '@/components/features/workspace/WorkspaceSettings'
import { SettingsNav } from './_components/SettingsNav'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <SettingsNav />
      <div className="flex-1">{children}</div>
    </div>
  )
} 