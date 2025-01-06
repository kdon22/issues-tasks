'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { Avatar } from '@/components/ui/Avatar'
import type { AvatarData } from '@/lib/types/avatar'

interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: string
  createdAt: Date
  updatedAt: Date
  user: {
    name: string | null
    email: string
  }
}

export default function WorkspaceMembersPage() {
  const params = useParams<{ workspaceUrl: string }>()
  if (!params) return null
  
  const workspaceUrl = params.workspaceUrl
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: members, isLoading } = api.workspace.getMembers.useQuery(
    { workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  const filteredMembers = members?.filter((member: WorkspaceMember) => 
    (member.user.name?.toLowerCase() || '').includes(debouncedSearch.toLowerCase()) ||
    member.user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    member.role.toLowerCase().includes(debouncedSearch.toLowerCase())
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
          {filteredMembers?.map((member: WorkspaceMember) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  data={{
                    type: 'INITIALS',
                    name: member.user.name || '',
                    color: 'bg-blue-500'
                  }}
                  size="md"
                />
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