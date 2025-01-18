'use client'

import { SettingsCard } from '@/domains/shared/layouts/settings/components/SettingsCard'
import { Table } from '@/domains/shared/components/data-display/Table'
import type { Column } from '@/domains/shared/components/data-display/Table'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/infrastructure/trpc/router'

type RouterOutput = inferRouterOutputs<AppRouter>
type TeamMember = RouterOutput['teamMember']['list'][number]

interface TeamMembersProps {
  members: TeamMember[]
  onUpdateRole: (userId: string, role: 'ADMIN' | 'MEMBER') => Promise<void>
}

export function TeamMembers({ members, onUpdateRole }: TeamMembersProps) {
  const columns: Column<TeamMember>[] = [
    {
      header: 'Name',
      accessorKey: 'user.name',
      cell: (member: TeamMember) => member.user.name,
      sortable: true
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (member: TeamMember) => (
        <select 
          value={member.role}
          onChange={(e) => onUpdateRole(member.user.id, e.target.value as 'ADMIN' | 'MEMBER')}
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
      ),
      sortable: true
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: (member: TeamMember) => new Date(member.createdAt).toLocaleDateString(),
      sortable: true
    }
  ]

  return (
    <SettingsCard>
      <SettingsCard.Content>
        <Table
          data={members}
          columns={columns}
          searchPlaceholder="Search members..."
        />
      </SettingsCard.Content>
    </SettingsCard>
  )
} 