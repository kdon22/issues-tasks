'use client'

import { Button } from '@/domains/shared/components/inputs'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { Table } from '@/domains/shared/components/data-display/Table'
import { useWorkspaceMembers } from '@/domains/workspaces/hooks/useWorkspaceMembers'
import type { WorkspaceMember } from '@/domains/workspaces/types'

export default function Page({
  params,
}: {
  params: { workspaceUrl: string }
}) {
  const { members = [], isLoading } = useWorkspaceMembers(params.workspaceUrl)

  if (isLoading) return null

  const columns = [
    {
      header: 'Member',
      accessorKey: 'user.name',
    },
    {
      header: 'Role',
      accessorKey: 'role',
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (value: string, member: WorkspaceMember) => (
        <Button variant="ghost" size="sm">
          Remove
        </Button>
      ),
    },
  ]

  return (
    <div>
      <SettingsHeader
        title="Workspace Members"
        description="Manage members of your workspace"
        actions={
          <Button variant="primary">
            Invite Members
          </Button>
        }
      />
      <div className="p-8">
        <Table
          data={members}
          columns={columns}
          searchable
        />
      </div>
    </div>
  )
} 