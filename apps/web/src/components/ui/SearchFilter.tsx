'use client'

import { useState, useEffect } from 'react'
import { Input } from './Input'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchFilter({ value, onChange, placeholder, className }: SearchFilterProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
} 