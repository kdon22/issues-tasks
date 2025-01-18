export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type IssuePriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface Issue {
  id: string
  title: string
  description?: string
  status: IssueStatus
  priority: IssuePriority
  assigneeId?: string
  reporterId: string
  projectId?: string
  labels: string[]
  createdAt: Date
  updatedAt: Date
} 