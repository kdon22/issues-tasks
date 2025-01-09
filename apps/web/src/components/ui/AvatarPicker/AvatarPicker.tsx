'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { IconPicker } from './IconPicker'
import { EmojiPicker } from './EmojiPicker'
import { ColorPicker } from './ColorPicker'
import { cn } from '@/lib/utils'
import { type AvatarData } from '@/lib/types/avatar'
import { Avatar } from '../Avatar'
import * as Popover from '@radix-ui/react-popover'

interface AvatarPickerProps {
  data: AvatarData
  onChange: (data: AvatarData) => void
}

export function AvatarPicker({ data, onChange }: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<'icon' | 'emoji' | 'upload'>('icon')
  const [searchTerm, setSearchTerm] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleColorChange = (color: string) => {
    switch (data.type) {
      case 'INITIALS':
        onChange({ ...data, color })
        break
      case 'ICON':
        onChange({ ...data, color })
        break
    }
    setShowColorPicker(false)
  }

  const handleReset = () => {
    onChange({
      type: 'INITIALS',
      name: data.name,
      color: '#000000'
    })
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="w-16 h-16 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
          <Avatar data={data} size="md" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden border border-gray-200 z-50" sideOffset={5}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Choose Avatar</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Reset
              </button>
              {(data.type === 'INITIALS' || data.type === 'ICON') && (
                <button
                  onClick={() => setShowColorPicker(true)}
                  className="p-1.5 rounded-md hover:bg-gray-100"
                >
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-200" 
                    style={{ backgroundColor: data.color }} 
                  />
                </button>
              )}
              <Popover.Close className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </Popover.Close>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('icon')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium',
                activeTab === 'icon' ? 'border-b-2 border-[#FF5C38] text-black' : 'text-gray-500'
              )}
            >
              Icon
            </button>
            <button
              onClick={() => setActiveTab('emoji')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium',
                activeTab === 'emoji' ? 'border-b-2 border-[#FF5C38] text-black' : 'text-gray-500'
              )}
            >
              Emoji
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium',
                activeTab === 'upload' ? 'border-b-2 border-[#FF5C38] text-black' : 'text-gray-500'
              )}
            >
              Upload
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          {showColorPicker ? (
            <ColorPicker
              color={data.type === 'INITIALS' || data.type === 'ICON' ? data.color : '#000000'}
              onChange={handleColorChange}
              onClose={() => setShowColorPicker(false)}
            />
          ) : (
            <>
              {activeTab === 'icon' && (
                <IconPicker
                  searchTerm={searchTerm}
                  onSelect={(icon) => onChange({
                    type: 'ICON',
                    name: data.name,
                    icon,
                    color: data.type === 'ICON' ? data.color : '#000000'
                  })}
                />
              )}
              {activeTab === 'emoji' && (
                <EmojiPicker
                  searchTerm={searchTerm}
                  onSelect={(emoji) => onChange({
                    type: 'EMOJI',
                    name: data.name,
                    emoji
                  })}
                />
              )}
              {activeTab === 'upload' && (
                <div className="p-4 text-center text-gray-500">
                  Upload functionality coming soon...
                </div>
              )}
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
} 