'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import type { TeamSettings } from '../types'

export function useTeamSettings(teamId: string) {
  const utils = trpc.useContext()
  const { data: team, isLoading } = trpc.team.get.useQuery({ id: teamId })

  const { mutate: updateTeam } = trpc.team.update.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id: teamId })
    }
  })

  const updateSettings = async (settings: TeamSettings) => {
    await updateTeam({ 
      id: teamId,
      settings 
    })
  }

  return {
    settings: team?.settings as TeamSettings,
    isLoading,
    updateSettings
  }
} 