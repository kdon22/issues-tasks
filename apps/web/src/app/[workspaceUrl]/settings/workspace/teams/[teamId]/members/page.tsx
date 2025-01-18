'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { TeamHeader, TeamMembers } from '@/domains/teams/components'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { trpc } from '@/infrastructure/trpc/core/client'

export default function TeamMembersPage({ 
  params 
}: { 
  params: { teamId: string } 
}) {
  const utils = trpc.useContext()

  const { data: team, isLoading } = trpc.team.get.useQuery(
    { id: params.teamId }
  )

  const { data: members } = trpc.teamMember.list.useQuery(
    { teamId: params.teamId }
  )

  const { mutateAsync: updateMember } = trpc.teamMember.update.useMutation({
    onSuccess: () => {
      utils.teamMember.list.invalidate({ teamId: params.teamId })
    }
  })

  if (isLoading || !team) return <LoadingSpinner />

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Suspense fallback={<LoadingSpinner />}>
          <TeamHeader team={team} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <TeamMembers
            members={members ?? []}
            onUpdateRole={async (userId: string, role: 'ADMIN' | 'MEMBER') => {
              await updateMember({
                teamId: params.teamId,
                userId,
                role
              })
            }}
          />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
} 