'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { useDebounce } from '@/hooks/useDebounce'

export default function WorkspaceMembersPage() {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: members, isLoading } = trpc.workspace.getMembers.useQuery(
    { workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  const { data: teams } = trpc.workspace.getTeams.useQuery(
    { workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Workspace Members</h1>
      </div>

      <div className="flex items-center gap-4">
        <SearchFilter
          value={search}
          onChange={setSearch}
          placeholder="Search members..."
          className="w-80"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {members?.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {member.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 