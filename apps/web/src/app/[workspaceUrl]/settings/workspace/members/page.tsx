'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'email' | 'role'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  const { data: members } = trpc.workspace.getMembers.useQuery()

  const filteredAndSortedMembers = members
    ?.filter(member => 
      member.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = sortField === 'role' ? a.role : a.user[sortField] || ''
      const bValue = sortField === 'role' ? b.role : b.user[sortField] || ''
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

  // Group by status
  const groupedMembers = {
    ACTIVE: filteredAndSortedMembers?.filter(m => m.user.status === 'ACTIVE'),
    PENDING: filteredAndSortedMembers?.filter(m => m.user.status === 'PENDING'),
    DISABLED: filteredAndSortedMembers?.filter(m => m.user.status === 'DISABLED')
  }

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="role">Role</option>
        </select>
        <button onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Render grouped sections */}
      {Object.entries(groupedMembers).map(([status, members]) => (
        members?.length > 0 && (
          <div key={status}>
            <h3>{status}</h3>
            <table>
              {/* Your existing table structure */}
            </table>
          </div>
        )
      ))}
    </div>
  )
} 