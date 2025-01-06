'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'

export default function PreferencesPage() {
  const { workspace } = useWorkspace()

  if (!workspace) return null

  return (
    <div>
      <h1>Preferences</h1>
    </div>
  )
} 