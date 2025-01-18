'use client'

import * as React from 'react'
import { Input } from './Input'

interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchFilter({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: SearchFilterProps) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
} 