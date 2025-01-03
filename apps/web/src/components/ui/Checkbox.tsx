'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CheckIcon } from '@heroicons/react/24/solid'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  className,
}: CheckboxProps) {
  return (
    <button
      id={id}
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'h-4 w-4 shrink-0 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        checked && 'bg-blue-600 border-blue-600',
        className
      )}
    >
      {checked && (
        <CheckIcon className="h-3 w-3 text-white" />
      )}
    </button>
  )
} 