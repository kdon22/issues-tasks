'use client'

import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'

export function useWorkspace() {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  const { data: workspace } = trpc.workspace.getByUrl.useQuery(
    { url: workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  return {
    workspace,
    workspaceUrl
  }
} 