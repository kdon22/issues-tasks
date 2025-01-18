import { AvatarType } from '@prisma/client'

export type EntityType = 'user' | 'workspace' | 'team'

export interface AvatarData {
  type: AvatarType
  name: string
  value: string
  color: string
}

export interface HasAvatar {
  id: string
  name: string
  avatarType: AvatarType
  avatarColor: string | null
  avatarIcon: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
} 