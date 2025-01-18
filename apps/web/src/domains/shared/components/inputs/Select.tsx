'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/domains/shared/utils/cn'

export interface SelectProps<T = string> {
  value: T | T[]
  onChange: (value: T | T[]) => void
  options: Array<{
    value: T
    label: string
    icon?: React.ComponentType<{ className?: string }>
    description?: string
    disabled?: boolean
  }>
  multiple?: boolean
  searchable?: boolean
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showArrow?: boolean
  trigger?: React.ReactNode
}

export function Select({
  value,
  onChange,
  options,
  multiple,
  searchable = false,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  className,
  size = 'md',
  showArrow = true,
  trigger
}: SelectProps<string>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlighted, setHighlighted] = useState(-1)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const searchRef = useRef<HTMLInputElement>(null)
  
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open, searchable])

  const sizeClasses = {
    sm: 'py-1 text-sm',
    md: 'py-2',
    lg: 'py-3 text-lg'
  }

  return (
    <div className="relative w-fit">
      <div className="relative mt-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <button
          ref={buttonRef}
          type="button"
          className={cn(
            "inline-flex items-center bg-white border rounded-md",
            "pl-2 pr-1 py-1.5 text-sm whitespace-nowrap",
            error && "border-red-300"
          )}
          onClick={() => setOpen(!open)}
        >
          <span>
            {options.find(o => o.value === value)?.label || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 ml-1 flex-shrink-0" />
        </button>

        {open && (
          <div 
            ref={menuRef} 
            className={cn(
              "absolute left-0 z-50 w-full mt-1",
              "bg-white rounded-lg shadow-lg",
              "border border-gray-200",
              "py-1"
            )}
          >
            {searchable && (
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Search..."
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex w-full items-center px-3 py-2",
                    "rounded-md text-sm text-gray-700",
                    "hover:bg-gray-50 cursor-pointer",
                    highlighted === index && "bg-gray-50",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <option.icon className="w-4 h-4 text-gray-500" />
                    )}
                    <span>{option.label}</span>
                  </div>
                  
                  {value === option.value && (
                    <Check className="w-4 h-4 ml-auto text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 