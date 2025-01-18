'use client'

import type { AvatarData } from '@/domains/shared/types/avatar'

interface AvatarProps {
  data: AvatarData
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  tooltip?: string
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export function Avatar({ data, size = 'md', className = '', tooltip }: AvatarProps) {
  if (!data) {
    return <div className={`rounded-full ${sizeClasses[size]} ${className} bg-gray-200`} />
  }

  const baseProps = {
    className: `rounded-full ${sizeClasses[size]} ${className}`,
    title: tooltip || data.name || ''
  }

  switch (data.type) {
    case 'IMAGE':
      return (
        <img
          src={data.value}
          alt={data.name}
          {...baseProps}
          className={`${baseProps.className} object-cover`}
        />
      )
    case 'EMOJI':
      return (
        <div {...baseProps} className={`${baseProps.className} bg-gray-100 flex items-center justify-center`}>
          {data.value}
        </div>
      )
    default:
      return (
        <div 
          {...baseProps} 
          className={`${baseProps.className} flex items-center justify-center`}
          style={{ backgroundColor: data.color }}
        >
          <span className="text-white">{data.value}</span>
        </div>
      )
  }
} 