'use client'

import { useState } from 'react'
import { ChevronDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavItem } from './NavItem'

export function FavoritesSection() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mt-4">
      <div className="px-3 mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Favorites</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 hover:bg-gray-100 rounded"
        >
          <ChevronDown 
            size={14} 
            className={cn(
              'text-gray-500 transition-transform',
              isExpanded && 'transform rotate-180'
            )} 
          />
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-1">
          <NavItem 
            icon={Star} 
            label="Active Issues" 
            href="/active-issues" 
          />
          {/* Add more favorite items here */}
        </div>
      )}
    </div>
  )
} 