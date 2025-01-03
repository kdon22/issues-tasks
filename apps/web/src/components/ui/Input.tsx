'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className = '', error, ...props }: InputProps) {
  return (
    <input
      className={`
        block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 
        shadow-sm ring-1 ring-inset ring-gray-300 
        placeholder:text-gray-400 
        focus:ring-2 focus:ring-inset focus:ring-blue-600 
        ${error ? 'ring-red-300 focus:ring-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  )
} 