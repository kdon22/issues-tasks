'use client'

import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { AVATAR_COLORS } from '@/types/avatar'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface IconPickerProps {
  type: "initials" | "icon" | "emoji" | "image"
  icon?: string | null
  color?: string | null
  emoji?: string | null
  imageUrl?: string | null
  onChange: (value: {
    type: "initials" | "icon" | "emoji" | "image"
    icon?: string | null
    color?: string | null
    emoji?: string | null
    imageUrl?: string | null
  }) => void
  children?: React.ReactNode
}

export function IconPicker({ type, icon, emoji, color, imageUrl, onChange, children }: IconPickerProps) {
  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          <Tab className={({ selected }) =>
            cn('w-full py-2.5 text-sm font-medium leading-5 rounded-lg',
              selected
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-900'
            )
          }>
            Icons
          </Tab>
          <Tab className={({ selected }) =>
            cn('w-full py-2.5 text-sm font-medium leading-5 rounded-lg',
              selected
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-900'
            )
          }>
            Emoji
          </Tab>
          <Tab className={({ selected }) =>
            cn('w-full py-2.5 text-sm font-medium leading-5 rounded-lg',
              selected
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-900'
            )
          }>
            Upload
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel className="space-y-4">
            {/* Icon Grid */}
            <div className="grid grid-cols-8 gap-2">
              {Object.keys(Icons).map((iconName) => {
                const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon
                return (
                  <button
                    key={iconName}
                    className={cn(
                      'p-2 rounded hover:bg-gray-100',
                      type === 'icon' && icon === iconName && 'bg-gray-100'
                    )}
                    onClick={() => onChange({ type: 'icon', icon: iconName })}
                  >
                    <IconComponent size={20} />
                  </button>
                )
              })}
            </div>
            
            {/* Color Selection */}
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_COLORS.map((colorOption) => (
                <button
                  key={colorOption.name}
                  className={cn(
                    'w-6 h-6 rounded-full',
                    colorOption.class,
                    color === colorOption.value && 'ring-2 ring-offset-2 ring-gray-400'
                  )}
                  onClick={() => onChange({ type: 'icon', icon, color: colorOption.value })}
                />
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            {/* Emoji Picker Implementation */}
            {/* You can use an emoji picker library here */}
          </Tab.Panel>

          <Tab.Panel>
            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Handle file upload
                  // You'll need to implement the upload logic
                }
              }}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
} 