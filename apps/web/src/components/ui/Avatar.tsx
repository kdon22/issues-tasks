'use client'

import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import { type LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { 
  type AvatarSize, 
  type AvatarData, 
  AVATAR_SIZES 
} from '@/lib/types/avatar'

interface AvatarProps {
  data: AvatarData
  size?: AvatarSize
  className?: string
}

export function Avatar({ data: { type, name, icon, color, emoji, imageUrl }, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const IconComponent = icon ? (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) : null

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg font-medium text-white',
        color || 'bg-blue-500',
        AVATAR_SIZES[size],
        className
      )}
    >
      {type === 'INITIALS' && initials}
      {type === 'ICON' && IconComponent && <IconComponent className="w-1/2 h-1/2" />}
      {type === 'EMOJI' && emoji}
      {type === 'IMAGE' && imageUrl && (
        <img 
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover rounded-lg"
        />
      )}
    </div>
  )
} 