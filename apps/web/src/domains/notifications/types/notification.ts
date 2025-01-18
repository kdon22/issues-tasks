export interface Notification {
  id: string
  type: 'MENTION' | 'ASSIGNED' | 'COMMENT' | 'STATUS_CHANGE'
  userId: string
  issueId?: string
  commentId?: string
  read: boolean
  createdAt: Date
} 