'use client'

import { trpc } from '@/infrastructure/trpc/core/client'
import { WorkspaceLayout } from '@/domains/workspaces/components/WorkspaceLayout'
import { IssuesList } from '@/domains/issues/components/IssuesList'
import { LoadingSpinner } from '@/domains/shared/components/feedback/LoadingSpinner'
import { HomeView } from '@/domains/shared/constants/preferences'

export default function WorkspacePage({ 
  params 
}: { 
  params: { workspaceUrl: string } 
}) {
  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.get.useQuery({ 
    id: params.workspaceUrl 
  })

  const { data: preferences, isLoading: preferencesLoading } = trpc.user.getPreferences.useQuery()

  if (workspaceLoading || preferencesLoading) return <LoadingSpinner />
  if (!workspace) return null

  const getViewFilter = () => {
    switch (preferences?.defaultHomeView) {
      case HomeView.ActiveIssues:
        return { status: 'active' as const }
      case HomeView.AllIssues:
        return {}
      case HomeView.MyIssues:
      default:
        return { assignedToMe: true }
    }
  }

  return (
    <WorkspaceLayout workspace={workspace}>
      <IssuesList 
        workspaceId={workspace.id}
        filter={getViewFilter()}
      />
    </WorkspaceLayout>
  )
} 