'use client'

import { cn } from '@/domains/shared/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className,
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        'animate-pulse bg-gray-200',
        {
          'rounded-full': variant === 'circular',
          'rounded': variant === 'rectangular',
          'rounded h-4 w-full': variant === 'text'
        },
        className
      )}
      style={{
        width: width,
        height: height
      }}
    />
  )
}

// Usage examples:
// <Skeleton variant="text" /> - For text lines
// <Skeleton variant="circular" width={40} height={40} /> - For avatars
// <Skeleton variant="rectangular" height={200} /> - For cards/images 