'use client'

import { useMemo, useState } from 'react'
import { 
  Smile, Star, Heart, Sun, Moon, Cloud, 
  Zap, Flag, Bell, User, Users, Book, 
  Box, Calendar, Camera, Clock, Compass, 
  Crown, Gift, Package, Phone, Shield,
  Target, Terminal, Trophy, Leaf, Activity,
  Music
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Define categories first to ensure we only use icons we have
const categories = [
  { id: 'recent', icon: Clock, label: 'Recent', icons: ['Clock', 'Calendar', 'Terminal'] },
  { id: 'people', icon: Users, label: 'People', icons: ['Users', 'User', 'Smile', 'Crown'] },
  { id: 'nature', icon: Leaf, label: 'Nature', icons: ['Sun', 'Moon', 'Cloud', 'Leaf'] },
  { id: 'objects', icon: Package, label: 'Objects', icons: ['Book', 'Phone', 'Gift', 'Box', 'Package'] },
  { id: 'activity', icon: Activity, label: 'Activity', icons: ['Activity', 'Target', 'Trophy', 'Music'] },
  { id: 'symbols', icon: Star, label: 'Symbols', icons: ['Star', 'Heart', 'Flag', 'Bell', 'Zap', 'Shield'] }
]

// Create iconMap only with icons we're actually using
const iconMap = {
  Smile, Star, Heart, Sun, Moon, Cloud, 
  Zap, Flag, Bell, User, Users, Book, 
  Box, Calendar, Camera, Clock, Compass, 
  Crown, Gift, Package, Phone, Shield,
  Target, Terminal, Trophy, Leaf,
  Activity, Music
}

type IconName = keyof typeof iconMap

interface IconPickerProps {
  searchTerm: string
  onSelect: (iconName: string) => void
}

export function IconPicker({ searchTerm, onSelect }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState('people')

  const filteredIcons = useMemo(() => {
    if (searchTerm) {
      return Object.keys(iconMap).filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return categories.find(cat => cat.id === activeCategory)?.icons || []
  }, [searchTerm, activeCategory])

  return (
    <div className="p-2">
      <div className="grid grid-cols-6 gap-2">
        {filteredIcons.map(iconName => {
          const Icon = iconMap[iconName as IconName]
          if (!Icon) return null
          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className="p-2 rounded hover:bg-gray-50 relative group"
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )
        })}
      </div>
      
      <div className="flex items-center justify-between px-2 py-1 mt-2 border-t">
        {categories.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              'p-1.5 rounded-md hover:bg-gray-100 transition-colors',
              activeCategory === id && 'text-[#FF5C38]'
            )}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  )
} 