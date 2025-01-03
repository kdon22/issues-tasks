export type AvatarType = 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE'
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarData {
  type: AvatarType
  name?: string
  icon?: string | null
  emoji?: string | null
  color?: string | null
  imageUrl?: string | null
}

export interface AvatarProps extends AvatarData {
  size?: AvatarSize
  className?: string
}

export const AVATAR_SIZES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

export const AVATAR_COLORS = [
  { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' }
] 

export function getInitials(name?: string, type: 'user' | 'entity' = 'user'): string {
  if (!name) return ''
  
  if (type === 'user') {
    // User: First Initial Last Initial
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  } else {
    // Entity (Workspace/Team/Project): First two letters
    return name.trim().substring(0, 2).toUpperCase()
  }
}

export function getRandomColor(): string {
  const colors = AVATAR_COLORS
  return colors[Math.floor(Math.random() * colors.length)].value
} 