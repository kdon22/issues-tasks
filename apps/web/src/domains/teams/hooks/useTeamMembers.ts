'use client'

import { trpc } from '@/infrastructure/trpc/core/client'

export function useTeamMembers(teamId: string) {
  const utils = trpc.useContext()
  const { data: members } = trpc.teamMember.list.useQuery({ 
    teamId 
  })

  const { mutate: updateRole } = trpc.teamMember.update.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate({ teamId })
    }
  })

  const { mutate: addMember } = trpc.teamMember.add.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate({ teamId })
    }
  })

  const { mutate: removeMember } = trpc.teamMember.remove.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate({ teamId })
    }
  })

  return {
    members,
    updateRole,
    addMember,
    removeMember
  }
} 