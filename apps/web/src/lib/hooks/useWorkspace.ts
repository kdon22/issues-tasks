'use client'

import { api } from '@/lib/trpc/client'


export function useWorkspace(workspaceUrl: string) {
  const { data: workspace, isLoading, error } = api.workspace.getCurrent.useQuery(
    { url: workspaceUrl },
    {
      enabled: !!workspaceUrl,
      retry: false
    }
  )

  return {
    workspace,
    isLoading,
    error
  }
} 