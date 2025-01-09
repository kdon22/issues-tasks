'use client'

import { WorkspaceLayoutClient } from '@/components/features/workspace/WorkspaceLayoutClient'
import { getWorkspace } from '@/lib/actions/workspace'

export default async function WorkspaceLayout({
  children,
  params: { workspaceUrl }
}: {
  children: React.ReactNode
  params: { workspaceUrl: string }
}) {
  const workspace = await getWorkspace(workspaceUrl)

  return (
    <WorkspaceLayoutClient initialWorkspace={workspace || null}>
      {children}
    </WorkspaceLayoutClient>
  )
} 