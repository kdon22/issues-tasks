'use client'

import { NavLink } from '@/domains/shared/components/navigation/NavLink'

export function WorkspaceSettingsNav({ workspaceUrl }: { workspaceUrl: string }) {
  return (
    <nav className="space-y-1">
      <NavLink href={`/${workspaceUrl}/settings/workspace/general`}>
        General
      </NavLink>
      <NavLink href={`/${workspaceUrl}/settings/workspace/members`}>
        Members
      </NavLink>
      <NavLink href={`/${workspaceUrl}/settings/workspace/teams`}>
        Teams
      </NavLink>
    </nav>
  )
} 