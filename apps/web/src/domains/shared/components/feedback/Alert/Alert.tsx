'use client'

import { cn } from '@/domains/shared/utils/cn'

interface AlertProps {
  children: React.ReactNode
  variant?: 'error' | 'warning' | 'success' | 'info'
  className?: string
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const variantStyles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return (
    <div className={cn(
      'p-4 rounded-md border',
      variantStyles[variant],
      className
    )}>
      {children}
    </div>
  )
} 