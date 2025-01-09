'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { type AvatarData } from '@/lib/types/avatar'
import { AVATAR_SIZES } from '@/lib/types/avatar'

interface AvatarProps {
  data: AvatarData
  size?: keyof typeof AVATAR_SIZES
  className?: string
}

export function Avatar({ data, size = 'md', className }: AvatarProps) {
  if (!data) {
    return (
      <div className={cn(
        "bg-gray-200 rounded-md flex items-center justify-center",
        AVATAR_SIZES[size],
        className
      )}>
        <span className="text-gray-400">?</span>
      </div>
    )
  }

  const content = useMemo(() => {
    switch (data.type) {
      case 'INITIALS':
        return (
          <div 
            className={cn(
              "rounded-md flex items-center justify-center",
              data.color || "bg-blue-500",
              AVATAR_SIZES[size],
              className
            )}
          >
            <span className="text-white font-medium text-sm">
              {data.name?.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )

      case 'ICON':
        return (
          <div 
            className={cn(
              "rounded-md flex items-center justify-center",
              data.color || "bg-blue-500",
              AVATAR_SIZES[size],
              className
            )}
          >
            {data.icon}
          </div>
        )

      case 'EMOJI':
        return (
          <div 
            className={cn(
              "rounded-md flex items-center justify-center bg-gray-100",
              AVATAR_SIZES[size],
              className
            )}
          >
            <span className="text-lg">{data.emoji}</span>
          </div>
        )

      case 'IMAGE':
        return (
          <div className={cn(
            "relative rounded-md overflow-hidden",
            AVATAR_SIZES[size],
            className
          )}>
            <Image
              src={data.imageUrl || ''}
              alt={data.name || 'Avatar'}
              fill
              className="object-cover"
            />
          </div>
        )

      default:
        return (
          <div className={cn(
            "bg-gray-200 rounded-md flex items-center justify-center",
            AVATAR_SIZES[size],
            className
          )}>
            <span className="text-gray-400">?</span>
          </div>
        )
    }
  }, [data, size, className])

  return content
} 