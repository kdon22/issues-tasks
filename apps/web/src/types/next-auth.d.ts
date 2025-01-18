import "next-auth"
import { type AvatarType } from '@/domains/shared/types/avatar'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      displayName: string | null
      avatarType: AvatarType
      avatarIcon: string | null
      avatarColor: string | null
      avatarEmoji: string | null
      avatarImageUrl: string | null
      defaultWorkspace: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    displayName: string | null
    avatarType: AvatarType
    avatarIcon: string | null
    avatarColor: string | null
    avatarEmoji: string | null
    avatarImageUrl: string | null
    defaultWorkspace: string | null
  }

  interface JWT {
    id: string
    defaultWorkspace: string | null
  }
} 