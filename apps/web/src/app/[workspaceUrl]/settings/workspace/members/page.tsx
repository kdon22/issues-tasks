'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { useParams } from 'next/navigation'
import { SearchFilter } from '@/components/ui/SearchFilter'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface WorkspaceMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    status: string
    avatarType: string
    avatarIcon: string | null
    avatarColor: string | null
    avatarEmoji: string | null
    avatarImageUrl: string | null
    nickname: string | null
  }
}

export default function WorkspaceMembersPage() {
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: workspace } = api.workspace.getCurrent.useQuery({ 
    url: workspaceUrl 
  })
  
  const { data: members, isLoading } = api.workspace.getMembers.useQuery(
    { workspaceUrl },
    { enabled: !!workspaceUrl }
  )

  const filteredMembers = members?.filter(member => 
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
          {filteredMembers?.map((member) => (
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