'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { WorkspaceMember, User } from '../types'

export function useWorkspaceMembers(workspaceUrl: string) {
  const utils = trpc.useContext()

  const { data: members = [], isLoading } = trpc.workspace.listMembers.useQuery({ 
    workspaceUrl 
  }) as { data: (WorkspaceMember & { user: User })[], isLoading: boolean }

  const { mutate: updateRole } = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate({ workspaceUrl })
    }
  })

  const { mutate: removeMember } = trpc.workspace.removeMember.useMutation({
    onSuccess: () => {
      utils.workspace.listMembers.invalidate({ workspaceUrl })
    }
  })

  return {
    members,
    isLoading,
    updateRole,
    removeMember
  }
} 