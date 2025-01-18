'use client'

import { useParams } from 'next/navigation'
import { SettingsLayout } from '@/domains/shared/layouts/settings/SettingsLayout'
import { useWorkspace } from '@/domains/workspaces/hooks/useWorkspace'

export default function Layout({
  children
}: {
  children: React.ReactNode
}) {
  console.log('Settings layout rendering')
  const params = useParams<{ workspaceUrl: string }>()
  const { workspace, isLoading } = useWorkspace(params.workspaceUrl)

  console.log('Settings layout workspace:', { workspace, isLoading })

  if (isLoading || !workspace) return null

  return (
    <div className="flex min-h-screen">
      <SettingsLayout>
        {children}
      </SettingsLayout>
    </div>
  )
} 