'use client'

import { Button } from '@/domains/shared/components/inputs'
import { SettingsHeader } from '@/domains/shared/layouts/settings/components/SettingsHeader'
import { Table, type Column } from '@/domains/shared/components/data-display/Table'
import { TeamAvatar } from '@/domains/teams/components'
import { useRouter } from 'next/navigation'
import { trpc } from '@/infrastructure/trpc/core/client'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/infrastructure/trpc/router'

type RouterOutput = inferRouterOutputs<AppRouter>
type Team = RouterOutput['workspace']['teams']['list'][number]

export default function Page({
  params,
}: {
  params: { workspaceUrl: string }
}) {
  const router = useRouter()
  const { data: teams = [] } = trpc.workspace.teams.list.useQuery(
    { workspaceUrl: params.workspaceUrl }
  )

  const columns: Column<Team>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (team: Team) => (
        <div className="flex items-center gap-3">
          <TeamAvatar teamId={team.id} size="sm" />
          <span>{team.name}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Identifier',
      accessorKey: 'identifier',
      sortable: true
    },
    {
      header: 'Members',
      accessorKey: '_count.members',
      cell: (team) => team._count?.members || 0,
      sortable: true
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (team) => new Date(team.createdAt).toLocaleDateString(),
      sortable: true
    }
  ]

  return (
    <div>
      <SettingsHeader
        title="Teams"
        description="Manage your workspace teams"
        actions={
          <Button 
            onClick={() => router.push(`/${params.workspaceUrl}/settings/workspace/teams/create`)}
          >
            Create Team
          </Button>
        }
      />
      <div className="p-8">
        <Table
          data={teams}
          columns={columns}
          searchable
          onRowClick={(team) => router.push(`/${params.workspaceUrl}/settings/workspace/teams/${team.id}`)}
        />
      </div>
    </div>
  )
} 