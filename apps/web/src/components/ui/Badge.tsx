'use client'

import { XMarkIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary'
  onRemove?: () => void
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default',
  onRemove,
  className 
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm',
      variant === 'default' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700',
      className
    )}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 hover:bg-black/5 rounded-full"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  )
} 