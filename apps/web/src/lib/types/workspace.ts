import { type AvatarType } from '@/types/avatar'

export interface Workspace {
  id: string
  name: string
  url: string
  avatarType: AvatarType
  avatarIcon?: string | null
  avatarColor?: string | null
  avatarEmoji?: string | null
  avatarImageUrl?: string | null
  members?: WorkspaceMember[]
}

interface WorkspaceMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
  }
} 