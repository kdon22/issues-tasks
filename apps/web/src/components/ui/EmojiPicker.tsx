'use client'

import { EMOJI_CATEGORIES } from '@/lib/data/emojis'
import { Tab } from '@headlessui/react'
import { cn } from '@/lib/utils'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 border-b">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <Tab
            key={category}
            className={({ selected }) =>
              cn(
                'px-3 py-2 text-sm font-medium',
                'focus:outline-none',
                selected
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )
            }
          >
            {category}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <Tab.Panel
            key={category}
            className="grid grid-cols-8 gap-2"
          >
            {emojis.map((emoji) => (
              <button
                key={emoji}
                className="p-2 text-xl hover:bg-gray-100 rounded"
                onClick={() => onSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  )
} 