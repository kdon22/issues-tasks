'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { usePathname } from 'next/navigation'
import { GeneralSettings } from '@/components/workspace/GeneralSettings'

export default function WorkspaceGeneralPage() {
  const pathname = usePathname() || ''
  const workspaceUrl = pathname.split('/')[1] || ''
  const { workspace, isLoading } = useWorkspace(workspaceUrl)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace) {
    return <div>Workspace not found</div>
  }

  return <GeneralSettings workspace={workspace} />
} 