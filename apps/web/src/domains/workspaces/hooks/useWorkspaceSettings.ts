'use client'

import { trpc } from '@/infrastructure/trpc/core/client'

export function useWorkspaceSettings(workspaceId: string) {
  const utils = trpc.useContext()
  const { data: settings, isLoading } = trpc.workspace.get.useQuery({ id: workspaceId })

  const { mutate: updateWorkspace } = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.get.invalidate({ id: workspaceId })
    }
  })

  return { settings, isLoading, updateWorkspace }
} 