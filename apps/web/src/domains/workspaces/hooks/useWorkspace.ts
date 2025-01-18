'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { Workspace } from '../types'

export function useWorkspace(workspaceUrl: string) {
  const utils = trpc.useContext()

  const { data: workspace, isLoading } = trpc.workspace.get.useQuery(
    { url: workspaceUrl },
    {
      retry: false,
      onError: (error) => {
        console.error('Error fetching workspace:', error)
      }
    }
  ) as { data: Workspace, isLoading: boolean }

  const { mutate: updateWorkspace } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate({ url: workspaceUrl })
    }
  })

  return {
    workspace,
    isLoading,
    updateWorkspace
  }
} 