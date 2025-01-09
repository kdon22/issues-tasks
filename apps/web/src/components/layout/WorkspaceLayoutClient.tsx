'use client'

import { WorkspaceProvider } from '@/providers/WorkspaceProvider'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import type { Workspace } from '@prisma/client'

interface WorkspaceLayoutClientProps {
  children: React.ReactNode
  initialWorkspace: Workspace | null
}

export function WorkspaceLayoutClient({ 
  children, 
  initialWorkspace 
}: WorkspaceLayoutClientProps) {
  const params = useParams<{ workspaceUrl: string }>()
  const { data: workspace } = api.workspace.getCurrent.useQuery(
    { url: params.workspaceUrl as string },
    { 
      initialData: initialWorkspace,
      enabled: !!params.workspaceUrl,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  )

  if (!workspace) {
    return null
  }

  return (
    <WorkspaceProvider initialWorkspace={workspace}>
      {children}
    </WorkspaceProvider>
  )
} 