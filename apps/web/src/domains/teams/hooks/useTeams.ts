'use client'

import { trpc } from '@/infrastructure/trpc/core/client'

export function useTeams(workspaceId: string) {
  const { data: teams, isLoading } = trpc.team.list.useQuery({ workspaceId })

  return {
    teams,
    isLoading
  }
} 