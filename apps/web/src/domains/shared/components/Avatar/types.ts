import type { AvatarData, AvatarType, EntityType } from '@/domains/shared/types/avatar'

export type { AvatarData, AvatarType, EntityType }
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  data: AvatarData
  size?: AvatarSize
  className?: string
  tooltip?: string
} 