import type { AvatarType } from '@/domains/shared/types/avatar'

export interface WorkspaceAvatar {
  type: AvatarType
  color?: string
  icon?: string
  emoji?: string
  imageUrl?: string
}

export interface Workspace {
  id: string
  name: string
  url: string
  description?: string | null
  createdAt: Date
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
  avatar: {
    type: AvatarType
    name: string
    value: string
    color: string
    icon?: string
    emoji?: string
    imageUrl?: string
  }
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
}

export interface WorkspaceInvite {
  id: string
  code: string
  email: string
  workspaceId: string
  role: 'ADMIN' | 'MEMBER'
  invitedById: string
  teamIds: string[]
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export interface User {
  id: string
  name: string | null
  email: string
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
} 