'use client'

import { TeamAvatar } from './TeamAvatar'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/infrastructure/trpc/router'

type RouterOutput = inferRouterOutputs<AppRouter>
type TeamType = NonNullable<RouterOutput['team']['get']>

interface TeamHeaderProps {
  team?: TeamType
}

export function TeamHeader({ team }: TeamHeaderProps) {
  if (!team) return null

  return (
    <div className="flex items-center gap-4">
      <TeamAvatar teamId={team.id} size="lg" />
      <div>
        <h2 className="text-lg font-medium">{team.name}</h2>
        {team.description && (
          <p className="text-sm text-gray-500">{team.description}</p>
        )}
      </div>
    </div>
  )
} 