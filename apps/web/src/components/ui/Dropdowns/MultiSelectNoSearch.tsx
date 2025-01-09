import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react'
import { MultiSelectProps } from './types'
import { useDropdownPosition } from './hooks/useDropdownPosition'
import { cn } from '@/lib/utils'

export const MultiSelectNoSearch: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultValue = [],
  onChange,
  className,
  dropdownWidth = 300
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set(defaultValue))
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const position = useDropdownPosition(buttonRef, dropdownWidth)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: string) => {
    const newSelected = new Set(selectedValues)
    if (newSelected.has(option)) {
      newSelected.delete(option)
    } else {
      newSelected.add(option)
    }
    setSelectedValues(newSelected)
    onChange(Array.from(newSelected))
  }

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedValues)
    newSelected.delete(value)
    setSelectedValues(newSelected)
    onChange(Array.from(newSelected))
  }

  const getDropdownStyles = () => {
    const baseStyles = cn(
      'absolute z-10 bg-white rounded-md shadow-lg border border-gray-200',
      'w-[300px]'
    )
    
    switch (position) {
      case 'left':
        return cn(baseStyles, 'right-full mr-2 top-0')
      case 'right':
        return cn(baseStyles, 'left-full ml-2 top-0')
      default:
        return cn(baseStyles, 'top-full mt-1 left-0')
    }
  }

  return (
    <div className={cn('relative inline-block w-auto', className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-2 text-left bg-white border rounded-md shadow-sm',
          'flex items-center justify-between gap-2',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5C38]'
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedValues.size > 0 ? (
            Array.from(selectedValues).map(value => (
              <span
                key={value}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {value}
                <button
                  onClick={(e) => removeValue(value, e)}
                  className="ml-1 hover:text-gray-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{label}</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={getDropdownStyles()}>
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                <span className="truncate flex-1">{option}</span>
                {selectedValues.has(option) && (
                  <Check className="w-4 h-4 text-[#FF5C38] flex-shrink-0 ml-2" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 