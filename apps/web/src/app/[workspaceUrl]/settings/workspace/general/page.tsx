'use client'

import { useParams } from 'next/navigation'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { GeneralSettings } from '@/domains/workspaces/components/WorkspaceGeneralSettings'
import { useWorkspace } from '@/domains/workspaces/hooks/useWorkspace'

export default function Page() {
  const params = useParams<{ workspaceUrl: string }>()
  const { workspace, isLoading } = useWorkspace(params.workspaceUrl)

  if (isLoading || !workspace) return null

  return (
    <div className="flex-1">
      <SettingsHeader
        title="General Settings"
        description="Manage your workspace settings"
      />
      <div className="p-8">
        <GeneralSettings workspace={workspace} />
      </div>
    </div>
  )
} 