import type { WorkspaceMember } from '@prisma/client'
import type { HasAvatar } from './avatar'

export interface Workspace extends HasAvatar {
  id: string
  name: string
  url: string
  members?: WorkspaceMember[]
} 