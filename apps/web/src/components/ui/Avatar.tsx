'use client'

import { useMemo } from 'react'
import { type AvatarProps, getInitials, getRandomColor, AVATAR_SIZES } from '@/types/avatar'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

export function Avatar({
  type = 'initials',
  name,
  icon,
  color,
  emoji,
  imageUrl,
  size = 'md',
  entityType = 'user',
  className
}: AvatarProps & { entityType?: 'user' | 'entity' }) {
  const initials = useMemo(() => getInitials(name, entityType), [name, entityType])
  const backgroundColor = useMemo(() => color || getRandomColor(), [color])
  
  const baseClasses = cn(
    'rounded-full flex items-center justify-center',
    AVATAR_SIZES[size],
    className
  )

  switch (type) {
    case 'image':
      if (imageUrl) {
        return (
          <img 
            src={imageUrl}
            alt={name}
            className={cn(baseClasses, 'object-cover')}
          />
        )
      }
      break

    case 'icon':
      if (icon) {
        const IconComponent = Icons[icon as keyof typeof Icons] as LucideIcon
        return (
          <div 
            className={baseClasses}
            style={{ backgroundColor: color || '#6B7280' }}
          >
            {IconComponent && (
              <IconComponent 
                className="w-1/2 h-1/2 text-white" 
                aria-hidden="true"
              />
            )}
          </div>
        )
      }
      break

    case 'emoji':
      if (emoji) {
        const emojiSizes = {
          sm: 'text-lg',
          md: 'text-xl',
          lg: 'text-2xl',
          xl: 'text-3xl'
        }
        return (
          <div className={cn(baseClasses, 'bg-gray-100')}>
            <span className={emojiSizes[size]}>{emoji}</span>
          </div>
        )
      }
      break
  }

  // Default or fallback to initials
  return (
    <div 
      className={baseClasses}
      style={{ backgroundColor }}
    >
      <span className="text-white font-medium">
        {initials}
      </span>
    </div>
  )
} 