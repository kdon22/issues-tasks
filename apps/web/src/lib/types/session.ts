import type { Session as NextAuthSession } from 'next-auth'
import { type AvatarType } from './avatar'

export interface Session extends NextAuthSession {
  user: {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    avatarType: AvatarType
    avatarIcon?: string
    avatarColor?: string
    avatarEmoji?: string
    avatarImageUrl?: string
  }
  workspace?: {
    id: string
    url: string
    name: string
  } | null
} 