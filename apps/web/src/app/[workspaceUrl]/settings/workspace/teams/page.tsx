'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { TeamAvatar } from '@/components/ui/TeamAvatar'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

export default function TeamsPage() {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  
  const { data: teams, isLoading } = trpc.workspace.getTeams.useQuery(
    { workspaceId: workspace?.id ?? '' },
    { enabled: !!workspace }
  )

  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.identifier.toLowerCase().includes(search.toLowerCase())
  )

  const sortedTeams = [...(filteredTeams || [])].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'members':
        return (b._count?.members || 0) - (a._count?.members || 0)
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Teams</h2>
        <Button
          onClick={() => {
            if (workspace) {
              router.push(`/${workspace.url}/settings/workspace/teams/new`)
            }
          }}
        >
          Create Team
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Filter teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={setSortBy}
          options={[
            { value: 'name', label: 'Sort by name' },
            { value: 'members', label: 'Sort by members' },
            { value: 'created', label: 'Sort by created date' },
          ]}
          className="w-40"
        />
      </div>

      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-gray-500">
          <div className="col-span-3">Team name</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Members</div>
          <div className="col-span-2">Issues</div>
          <div className="col-span-1">Created</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y">
          {sortedTeams.map((team) => (
            <div key={team.id} className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-900 hover:bg-gray-50">
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <TeamAvatar team={team} size="sm" />
                  <div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.identifier}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-3 text-gray-500">
                {team.description || 'No description'}
              </div>
              <div 
                className="col-span-2 text-blue-600 hover:underline cursor-pointer"
                onClick={() => {
                  if (workspace) {
                    router.push(`/${workspace.url}/settings/workspace/teams/${team.id}/members`)
                  }
                }}
              >
                {team._count?.members || 0} members
              </div>
              <div className="col-span-2 text-gray-500">
                {team._count?.issues || 0} issues
              </div>
              <div className="col-span-1 text-gray-500">
                {formatDate(team.createdAt)}
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          ))}

          {sortedTeams.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No teams found. Create your first team to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 