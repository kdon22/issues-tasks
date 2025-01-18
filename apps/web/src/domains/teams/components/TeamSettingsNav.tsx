'use client'

import { NavLink } from '@/domains/shared/components/navigation/NavLink'
import type { Team } from '../types'

interface TeamSettingsNavProps {
  team?: Team
}

export function TeamSettingsNav({ team }: TeamSettingsNavProps) {
  if (!team) return null

  return (
    <nav className="space-y-1">
      <NavLink href={`/settings/workspace/teams/${team.id}/settings`}>
        General
      </NavLink>
      <NavLink href={`/settings/workspace/teams/${team.id}/members`}>
        Members
      </NavLink>
      <NavLink href={`/settings/workspace/teams/${team.id}/permissions`}>
        Permissions
      </NavLink>
    </nav>
  )
} 