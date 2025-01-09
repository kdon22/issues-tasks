import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, Search, Check } from 'lucide-react'
import { SingleSelectProps } from './types'
import { useDropdownPosition } from './hooks/useDropdownPosition'
import { cn } from '@/lib/utils'

export const SingleSelect: React.FC<SingleSelectProps> = ({
  label,
  options,
  defaultValue = '',
  onChange,
  className,
  dropdownWidth = 300
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [searchTerm, setSearchTerm] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const position = useDropdownPosition(buttonRef, dropdownWidth)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (option: string) => {
    setSelectedValue(option)
    setSearchTerm('')
    setIsOpen(false)
    onChange(option)
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
    <div className={cn('relative inline-block', className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-2 text-left bg-white border rounded-md shadow-sm',
          'flex items-center justify-between gap-2',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF5C38]',
          className
        )}
      >
        <span className="text-gray-700 truncate">
          {selectedValue || label}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={getDropdownStyles()}>
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full pl-8 pr-4 py-1 text-sm border rounded-md',
                  'focus:outline-none focus:ring-2 focus:ring-[#FF5C38] focus:border-transparent'
                )}
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-auto py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              >
                <span className="truncate">{option}</span>
                {selectedValue === option && (
                  <Check className="w-4 h-4 text-[#FF5C38] flex-shrink-0 ml-auto" />
                )}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2 text-gray-500 text-center">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
} 