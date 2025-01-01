'use client'

import { cn } from '@/lib/utils'
import { CheckIcon } from '@heroicons/react/20/solid'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  className?: string
}

export function Checkbox({ 
  id, 
  checked = false, 
  onChange, 
  label,
  className 
}: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <div 
        className={cn(
          "w-4 h-4 border rounded flex items-center justify-center",
          checked ? "bg-primary border-primary" : "border-gray-300",
        )}
        onClick={() => onChange?.(!checked)}
      >
        {checked && (
          <CheckIcon className="w-3 h-3 text-white" />
        )}
      </div>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
    </label>
  )
} 