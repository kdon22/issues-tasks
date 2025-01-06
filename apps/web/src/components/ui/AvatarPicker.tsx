'use client'

import { useState } from 'react'
import { Dialog } from './Dialog'
import { Avatar } from './Avatar'
import { type AvatarData, type AvatarType } from '@/lib/types/avatar'
import { Tab } from '@headlessui/react'
import { cn } from '@/lib/utils'
import { EmojiPicker } from './EmojiPicker'
import { ImageUploader } from './ImageUploader'
import * as Icons from 'lucide-react'

interface AvatarPickerProps {
  value: AvatarData
  onChange: (data: AvatarData) => void
  name: string
}

const COLORS = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
]

export function AvatarPicker({ value, onChange, name }: AvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  const handleTypeChange = (type: AvatarType) => {
    onChange({
      ...value,
      type,
      name
    })
  }

  const handleRemove = () => {
    onChange({
      type: 'INITIALS',
      name,
      color: 'bg-blue-500'
    })
    setIsOpen(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    onChange({
      type: 'EMOJI',
      name,
      emoji
    })
  }

  const handleIconSelect = (icon: string) => {
    onChange({
      type: 'ICON',
      name,
      icon,
      color: value.color || 'bg-blue-500'
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    onChange({
      type: 'IMAGE',
      name,
      imageUrl
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 focus:outline-none"
      >
        <Avatar data={value} size="lg" />
      </button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Change Avatar"
      >
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
            <Tab className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }>
              Emoji
            </Tab>
            <Tab className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }>
              Icon
            </Tab>
            <Tab className={({ selected }) =>
              cn(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'
              )
            }>
              Upload
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-4">
            {/* Emoji Panel */}
            <Tab.Panel className="h-64 overflow-y-auto">
              <EmojiPicker 
                onSelect={handleEmojiSelect} 
              />
            </Tab.Panel>

            {/* Icon Panel */}
            <Tab.Panel className="h-64 overflow-y-auto">
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Color</h3>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-full',
                        color,
                        value.color === color && 'ring-2 ring-offset-2 ring-blue-500'
                      )}
                      onClick={() => onChange({ ...value, color })}
                    />
                  ))}
                </div>
              </div>
            </Tab.Panel>

            {/* Upload Panel */}
            <Tab.Panel className="h-64">
              <ImageUploader
                onUpload={handleImageUpload}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <div className="mt-4 flex justify-between">
          <button
            onClick={handleRemove}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Remove & use initials
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </Dialog>
    </>
  )
} 