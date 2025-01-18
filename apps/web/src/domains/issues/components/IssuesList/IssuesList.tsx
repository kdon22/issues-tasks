'use client'

import { IssuesListHeader } from './IssuesListHeader'
import { IssuesListToolbar } from './IssuesListToolbar'
import { IssuesListFilters } from './IssuesListFilters'
import { IssuesListEmpty } from './IssuesListEmpty'
import { IssuesListLoading } from './IssuesListLoading'

interface IssuesListProps {
  workspaceId: string
  filter?: {
    status?: 'active'
    assignedToMe?: boolean
  }
}

export function IssuesList({ workspaceId, filter = {} }: IssuesListProps) {
  return (
    <div className="flex flex-col h-full">
      <IssuesListHeader />
      <IssuesListToolbar />
      <IssuesListFilters />
      {/* List content */}
    </div>
  )
} 