'use client'

import { useState, useEffect } from 'react'
import { Input } from './Input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  placeholder?: string
  onSearch: (value: string) => void
  className?: string
}

export function SearchFilter({ placeholder = 'Filter by name, email or role', onSearch, className }: SearchFilterProps) {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={cn(
        'h-11 text-base px-4',
        className
      )}
    />
  )
} 