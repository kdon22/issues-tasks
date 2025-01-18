'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { TeamSettingsNav } from '@/domains/teams/components/TeamSettingsNav'
import { TeamHeader } from '@/domains/teams/components/TeamHeader'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { trpc } from '@/infrastructure/trpc/core/client'
import type { Team } from '@/domains/teams/types'

export default function TeamSettingsLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { workspaceUrl: string; teamId: string }
}) {
  const { data: team, isLoading } = trpc.team.get.useQuery(
    { id: params.teamId }
  ) as { data: Team | undefined, isLoading: boolean }

  if (isLoading) return <LoadingSpinner />
  if (!team) return null

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Suspense fallback={<LoadingSpinner />}>
          <TeamHeader team={team} />
        </Suspense>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <TeamSettingsNav team={team} />
          </div>

          <div className="col-span-9">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
} 