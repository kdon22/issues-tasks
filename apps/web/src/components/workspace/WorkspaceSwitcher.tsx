'use client'

import { useWorkspace } from '@/hooks/useWorkspace'
import { Dropdown } from '@/components/ui/Dropdown'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'

export function WorkspaceSwitcher() {
  const { workspace } = useWorkspace()
  const { data: workspaces } = trpc.auth.getWorkspaces.useQuery()

  if (!workspace) return null

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50">
          <span>{workspace.name}</span>
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      }
      items={workspaces?.map(ws => ({
        label: ws.name,
        href: `/${ws.url}/my-issues`
      })) || []}
    />
  )
} 