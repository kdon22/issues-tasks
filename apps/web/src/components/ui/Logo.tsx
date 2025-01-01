'use client'

interface LogoProps {
  variant?: 'default' | 'mobile'
  className?: string
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        className={`${variant === 'mobile' ? 'h-8 w-8' : 'h-10 w-10'} text-orange-500`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H7v-2h5V7h2v4h5v2h-5v4z"/>
      </svg>
      <span className={`ml-2 font-bold ${variant === 'mobile' ? 'text-xl' : 'text-2xl'} text-gray-900`}>
        IssuesTasks
      </span>
    </div>
  )
} 