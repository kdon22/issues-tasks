import type { AvatarType } from '@prisma/client'

export interface Team {
  id: string
  workspaceId: string
  name: string
  identifier: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
  settings: TeamSettings
}

export type TeamSettings = {
  isPrivate: boolean
  allowMemberInvites: boolean
  requireAdminApproval: boolean
}

export const DefaultTeamSettings: TeamSettings = {
  isPrivate: false,
  allowMemberInvites: true,
  requireAdminApproval: false
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
} 