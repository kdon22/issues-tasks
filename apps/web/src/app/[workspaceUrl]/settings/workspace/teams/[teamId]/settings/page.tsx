'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { trpc } from '@/infrastructure/trpc/core/client'
import { useRouter } from 'next/navigation'
import { TeamSettings } from '@/domains/teams/components'
import type { Team, TeamSettings as TeamSettingsType } from '@/domains/teams/types'

export default function TeamSettingsPage({ 
  params 
}: { 
  params: { workspaceUrl: string; teamId: string } 
}) {
  const router = useRouter()
  const utils = trpc.useContext()
  
  const { data: team } = trpc.team.get.useQuery(
    { id: params.teamId }
  ) as { data: Team | undefined }

  const { mutate: updateTeam } = trpc.team.update.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id: params.teamId })
    }
  })

  const { mutate: deleteTeam } = trpc.team.delete.useMutation({
    onSuccess: () => {
      router.push(`/${params.workspaceUrl}/settings/workspace/teams`)
    }
  })

  if (!team) return <LoadingSpinner />

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <TeamSettings
          team={team}
          onUpdate={async (settings: TeamSettingsType) => {
            await updateTeam({
              id: team.id,
              ...settings
            })
          }}
          onDelete={async () => {
            await deleteTeam({ id: team.id })
          }}
        />
      </Suspense>
    </ErrorBoundary>
  )
} 