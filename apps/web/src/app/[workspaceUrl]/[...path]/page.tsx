'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'

interface PageParams {
  workspaceUrl: string
  path: string[]
}

export default function WorkspacePage({ params }: { params: PageParams }) {
  const { data: workspace, isLoading } = trpc.workspace.get.useQuery(
    { id: params.workspaceUrl }
  )

  if (isLoading) return <LoadingSpinner />
  if (!workspace) return null

  return (
    <ErrorBoundary>
      <div>
        <h1>{workspace.name}</h1>
        <div>{workspace.url}</div>
      </div>
    </ErrorBoundary>
  )
} 