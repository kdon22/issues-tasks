'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { EntityAvatar } from '@/components/ui/EntityAvatar'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

export default function TeamsPage() {
  const { workspace } = useWorkspace()
  const router = useRouter()
  const { data: teams } = api.team.list.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace?.id }
  )

  if (!workspace) return null

  const sortedTeams = [...(teams || [])].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button 
          onClick={() => router.push(`/${workspace.url}/settings/workspace/teams/new`)}
        >
          New team
        </Button>
      </div>

      {/* Teams list */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-2">Name</div>
          <div>Members</div>
          <div>Created</div>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedTeams.map((team) => (
            <div key={team.id} className="grid grid-cols-4 gap-4 p-4 text-sm">
              <div className="col-span-2 flex items-center gap-3">
                <EntityAvatar 
                  entityType="team"
                  entityId={team.id}
                  size="sm"
                />
                <div>
                  <div className="font-medium text-gray-900">{team.name}</div>
                  <div className="text-gray-500">{team.identifier}</div>
                </div>
              </div>
              <div className="text-gray-500">
                {team._count?.members || 0} members
              </div>
              <div className="text-gray-500">
                {formatDate(team.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 