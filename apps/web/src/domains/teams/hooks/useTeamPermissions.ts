'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { TeamSettings } from '../types'

export function useTeamPermissions(teamId: string) {
  const utils = trpc.useContext()
  const { data: team, isLoading } = trpc.team.get.useQuery({ id: teamId })

  const { mutate: updateTeam } = trpc.team.update.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id: teamId })
    }
  })

  const updatePermission = async (key: keyof TeamSettings, value: boolean) => {
    const currentSettings = team?.settings as TeamSettings || {
      isPrivate: false,
      allowMemberInvites: true,
      requireAdminApproval: false
    }

    await updateTeam({
      id: teamId,
      settings: {
        ...currentSettings,
        [key]: value
      }
    })
  }

  return {
    permissions: team?.settings as TeamSettings,
    isLoading,
    updatePermission
  }
} 