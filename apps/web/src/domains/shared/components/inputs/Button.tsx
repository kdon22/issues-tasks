'use client'

import { forwardRef } from 'react'
import { cn } from '@/domains/shared/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'compact' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, loading, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors h-8',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          {
            'bg-black text-white hover:bg-[#FF5C38] focus-visible:ring-[#FF5C38] transition-colors duration-200': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500': variant === 'secondary',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500': variant === 'outline',
            'bg-white text-gray-700 hover:text-[#FF5C38] px-3 text-sm border border-gray-200 shadow-sm': variant === 'compact',
            'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500': variant === 'destructive',
            'px-2.5 text-sm': size === 'sm',
            'px-4 text-sm': size === 'md',
            'px-6 text-base': size === 'lg',
            'cursor-not-allowed opacity-60': disabled || loading,
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button' 