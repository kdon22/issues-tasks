'use client'

import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'

export function useWorkspace() {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  const { data: workspace, isLoading } = trpc.workspace.getByUrl.useQuery(
    { url: workspaceUrl },
    { 
      enabled: !!workspaceUrl,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    }
  )

  return {
    workspace,
    workspaceUrl,
    isLoading
  }
} 