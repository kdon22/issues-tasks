'use client'

import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { Dropdown } from '@/components/ui/Dropdown'
import { api } from '@/lib/trpc/client'

interface WorkspaceData {
  id: string
  name: string
  url: string
}

export function WorkspaceSwitcher() {
  const { workspace } = useWorkspace(window.location.pathname.split('/')[1])
  const { data: workspaces } = api.auth.getWorkspaces.useQuery()

  if (!workspace) return null

  return (
    <Dropdown
      value={workspace.url}
      onChange={(url) => {
        window.location.href = `/${url}/my-issues`
      }}
      options={workspaces?.map((ws: WorkspaceData) => ({
        value: ws.url,
        label: ws.name
      })) || []}
    />
  )
} 