'use client'

import { SettingsLayout } from '@/components/features/settings/SettingsLayout'

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SettingsLayout>{children}</SettingsLayout>
} 