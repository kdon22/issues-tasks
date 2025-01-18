'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { WorkspaceInvite } from '../types'

export function useWorkspaceInvites(workspaceUrl: string) {
  const utils = trpc.useContext()

  const { data: invites = [], isLoading } = trpc.workspace.listInvites.useQuery({ 
    workspaceUrl 
  }) as { data: WorkspaceInvite[], isLoading: boolean }

  const { mutate: createInvite } = trpc.workspace.createInvite.useMutation({
    onSuccess: () => {
      utils.workspace.listInvites.invalidate({ workspaceUrl })
    }
  })

  const { mutate: cancelInvite } = trpc.workspace.cancelInvite.useMutation({
    onSuccess: () => {
      utils.workspace.listInvites.invalidate({ workspaceUrl })
    }
  })

  return {
    invites,
    isLoading,
    createInvite,
    cancelInvite
  }
} 