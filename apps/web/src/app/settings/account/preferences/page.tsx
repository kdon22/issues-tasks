'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function PreferencesPage() {
  const { data: workspace } = trpc.workspace.getCurrent.useQuery()
  const { data: preferences, isLoading } = trpc.user.getPreferences.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace }
  )
  
  const updatePreferences = trpc.user.updatePreferences.useMutation()

  const [formData, setFormData] = useState({
    defaultHomeView: preferences?.defaultHomeView || 'active-issues',
    displayFullNames: preferences?.displayFullNames || true,
    firstDayOfWeek: preferences?.firstDayOfWeek || 'Monday',
    useEmoticons: preferences?.useEmoticons || true,
    fontSize: preferences?.fontSize || 'default',
    usePointerCursor: preferences?.usePointerCursor || true,
    interfaceTheme: preferences?.interfaceTheme || 'system',
  })

  if (isLoading || !workspace) {
    return <div>Loading...</div>
  }

  const handleUpdate = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    updatePreferences.mutate({
      workspaceId: workspace.id,
      preferences: { [key]: value }
    })
  }

  // ... rest of the component
} 