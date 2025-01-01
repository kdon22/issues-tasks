'use client'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  icon?: string | null
  color?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg'
}

export function Avatar({ name, src, icon, color = 'gray', size = 'md', className }: AvatarProps) {
  // Get initials from name
  const initials = getInitials(name)
  
  // Use color if provided, otherwise use gray
  const bgColor = color ? `bg-${color}-100` : 'bg-gray-100'
  const textColor = color ? `text-${color}-700` : 'text-gray-700'

  // If we have a src (image URL), show the image
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  // If we have an icon, show the icon
  if (icon) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full',
        bgColor,
        textColor,
        sizeClasses[size],
        className
      )}>
        <span className="material-icons-outlined">{icon}</span>
      </div>
    )
  }

  // Otherwise show initials
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full font-medium',
      bgColor,
      textColor,
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  )
} 