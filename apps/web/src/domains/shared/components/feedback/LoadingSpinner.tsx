'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const spinner = (
    <div 
      className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]} ${className}`}
    />
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex justify-center p-4">
      {spinner}
    </div>
  )
} 