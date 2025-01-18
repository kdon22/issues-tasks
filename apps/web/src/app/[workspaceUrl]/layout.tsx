'use client'

import { type ReactNode } from 'react'
import { MainNav } from '@/domains/navigation/components/MainNav/MainNav'
import { WorkspaceLayoutClient } from '@/domains/workspaces/components/WorkspaceLayoutClient'
import { useWorkspace } from '@/domains/workspaces/hooks/useWorkspace'
import { toAvatarData } from '@/domains/shared/components/Avatar/utils'
import type { Workspace } from '@/domains/workspaces/types'

export default function WorkspaceLayout({
  children,
  params: { workspaceUrl }
}: {
  children: ReactNode
  params: { workspaceUrl: string }
}) {
  const { workspace, isLoading } = useWorkspace(workspaceUrl)
  console.log('WorkspaceLayout starting render')

  if (isLoading) {
    console.log('WorkspaceLayout is loading')
    return <div>Loading...</div>
  }

  if (!workspace) {
    console.log('WorkspaceLayout no workspace')
    return <div>No workspace found</div>
  }

  const workspaceWithAvatar: Workspace = {
    ...workspace,
    avatar: toAvatarData(workspace)
  }

  return (
    <WorkspaceLayoutClient 
      initialWorkspace={workspaceWithAvatar}
    >
      <div className="flex min-h-screen">
        <MainNav />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </WorkspaceLayoutClient>
  )
} 