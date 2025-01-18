'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { TeamPermissions } from '@/domains/teams/components/TeamPermissions'

export default function TeamPermissionsPage({ 
  params 
}: { 
  params: { teamId: string } 
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <TeamPermissions teamId={params.teamId} />
      </Suspense>
    </ErrorBoundary>
  )
} 