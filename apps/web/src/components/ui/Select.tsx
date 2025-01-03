'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps<T extends string = string> {
  value: T
  onChange: (value: T) => void
  options: Array<{
    label: string
    value: T
  }>
  className?: string
  label?: string
}

export function Select<T extends string = string>({ value, onChange, options, className, label }: SelectProps<T>) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={className}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

Select.displayName = 'Select' 