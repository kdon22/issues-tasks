'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/domains/shared/utils/cn'
import { NavItem } from './NavItem'
import type { LucideIcon } from 'lucide-react'

interface TeamSectionProps {
  label: string
  icon: LucideIcon
  children: React.ReactNode
}

export function TeamSection({ label, icon: Icon, children }: TeamSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-gray-800 hover:bg-gray-100 rounded-md"
      >
        <Icon size={18} className="text-gray-700" />
        <span className="text-sm flex-1 text-left">{label}</span>
        <ChevronDown 
          size={14} 
          className={cn(
            'text-gray-500 transition-transform',
            isExpanded && 'transform rotate-180'
          )} 
        />
      </button>
      {isExpanded && (
        <div className="mt-1 ml-2 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
} 