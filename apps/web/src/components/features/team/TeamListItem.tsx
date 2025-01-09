'use client'

import { TeamAvatar } from './TeamAvatar'
import type { Team } from '@prisma/client'
import Link from 'next/link'

interface TeamListItemProps {
  team: Team
  workspaceUrl: string
}

export function TeamListItem({ team, workspaceUrl }: TeamListItemProps) {
  return (
    <Link 
      href={`/${workspaceUrl}/teams/${team.identifier}`}
      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
    >
      <TeamAvatar team={team} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{team.name}</div>
      </div>
    </Link>
  )
} 