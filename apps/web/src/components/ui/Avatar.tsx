'use client'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  type: 'initials' | 'icon' | 'image'
  name: string | null | undefined
  icon?: string | null
  color?: string | null
  imageUrl?: string | null
  className?: string
}

export function Avatar({ type, name, icon, color, imageUrl, className }: AvatarProps) {
  const baseClasses = 'w-12 h-12 flex items-center justify-center rounded-md'
  const colorClasses = color 
    ? `border border-${color}-200 bg-${color}-50 text-${color}-700`
    : 'border border-blue-200 bg-blue-50 text-blue-700'

  const initials = name ? getInitials(name) : '??'

  return (
    <div className={cn(baseClasses, colorClasses, className)}>
      {type === 'initials' && (
        <span className="text-lg font-semibold select-none">
          {initials}
        </span>
      )}
      {type === 'icon' && icon && (
        <span className="text-lg">
          {icon}
        </span>
      )}
      {type === 'image' && imageUrl && (
        <img 
          src={imageUrl} 
          alt={name || 'User avatar'}
          className="w-full h-full object-cover rounded-md"
        />
      )}
    </div>
  )
} 