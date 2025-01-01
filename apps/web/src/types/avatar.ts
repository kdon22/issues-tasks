import { type IconName } from 'lucide-react'

export type AvatarType = 'initials' | 'icon' | 'image'
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

export interface AvatarData {
  id: string
  name: string
  type: AvatarType
  icon?: string | null
  color?: string | null
  imageUrl?: string | null
}

// Size configurations for consistent styling
export const sizeConfig = {
  xs: { dimensions: 'w-6 h-6', fontSize: 'text-xs', iconSize: 12 },
  sm: { dimensions: 'w-8 h-8', fontSize: 'text-sm', iconSize: 16 },
  md: { dimensions: 'w-10 h-10', fontSize: 'text-base', iconSize: 20 },
  lg: { dimensions: 'w-12 h-12', fontSize: 'text-lg', iconSize: 24 }
} as const

// Color options matching our existing theme
export const colorOptions = [
  { name: 'gray', class: 'gray-500' },
  { name: 'red', class: 'red-500' },
  { name: 'orange', class: 'orange-500' },
  // ... add more colors matching your theme
] 