import { type Role } from '@prisma/client'

export interface WorkspaceMember {
  id: string
  role: Role
  userId: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  url: string
  icon: string | null
  iconColor: string | null
  createdAt: Date
  updatedAt: Date
  members: WorkspaceMember[]
}

// Type for the router output
export type WorkspaceWithMembers = Workspace & {
  members: WorkspaceMember[]
} 