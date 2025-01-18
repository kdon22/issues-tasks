'use client'

import * as React from 'react'
import { cn } from '@/domains/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  label?: string;
  helperText?: string;
}

export function Input({ className = '', error, label, helperText, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(`
          block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 
          shadow-sm ring-1 ring-inset ring-gray-300 
          placeholder:text-gray-400 
          focus:ring-2 focus:ring-inset focus:ring-blue-600 
          ${error ? 'ring-red-300 focus:ring-red-500' : ''}
          ${className}
        `)}
        {...props}
      />
      {typeof error === 'string' && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
} 