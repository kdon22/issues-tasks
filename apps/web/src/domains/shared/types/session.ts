import type { DefaultSession } from 'next-auth'
import type { Workspace } from '@prisma/client'
import type { AvatarType } from './avatar'

declare module 'next-auth' {
  interface Session extends DefaultSession {
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
    workspace?: Workspace | null
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
} 