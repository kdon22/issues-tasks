'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { CheckIcon } from '@heroicons/react/20/solid'

interface Option {
  label: string
  value: string
  icon?: string
  iconColor?: string
}

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  placeholder?: string
}

export function MultiSelect({ value, onChange, options, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter(option => value.includes(option.value))
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase()) &&
    !value.includes(option.value)
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange([...value, optionValue])
    setSearch('')
  }

  const handleRemove = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue))
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="min-h-[38px] w-full border rounded-md bg-white px-3 py-1.5 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map(option => (
            <div
              key={option.value}
              className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
            >
              {option.icon && (
                <span 
                  className="w-4 h-4"
                  style={{ color: option.iconColor }}
                  dangerouslySetInnerHTML={{ __html: option.icon }}
                />
              )}
              {option.label}
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(option.value)
                }}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            className={cn(
              "flex-1 outline-none min-w-[120px] text-sm",
              selectedOptions.length === 0 ? "text-gray-900" : "text-gray-600"
            )}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1 max-h-60 overflow-auto">
            {filteredOptions.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon && (
                    <span 
                      className="w-4 h-4 mr-2"
                      style={{ color: option.iconColor }}
                      dangerouslySetInnerHTML={{ __html: option.icon }}
                    />
                  )}
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 