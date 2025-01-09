import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { SingleSelectProps } from './types'
import { cn } from '@/lib/utils'

export const SingleSelectNoSearch: React.FC<SingleSelectProps> = ({
  label,
  options,
  defaultValue = '',
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [buttonWidth, setButtonWidth] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedItemRef = useRef<HTMLLIElement>(null)

  // Calculate button width on mount and when options change
  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth)
    }
  }, [options])

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isOpen])

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
    setSelectedValue(option)
    setIsOpen(false)
    onChange(option)
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
        <div 
          ref={dropdownRef} 
          className={cn(
            'absolute z-10 w-fit min-w-full bg-white rounded-md shadow-lg border border-gray-200',
            'top-[-4px] left-0'
          )}
          style={{ minWidth: `${buttonWidth}px` }}
        >
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option, index) => (
              <li
                key={index}
                ref={selectedValue === option ? selectedItemRef : null}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center whitespace-nowrap"
              >
                <span className="truncate flex-1">{option}</span>
                {selectedValue === option && (
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