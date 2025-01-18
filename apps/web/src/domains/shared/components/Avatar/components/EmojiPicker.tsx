'use client'

import { useState } from 'react'
import { Clock, Users, TreePine, Shapes, Sparkles } from 'lucide-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  searchQuery?: string
}

const categories = [
  { id: 'recent', icon: Clock, label: 'Recent', emojis: ['😊', '🌟', '💫', '🚀'] },
  { id: 'people', icon: Users, label: 'People', emojis: ['😀', '😊', '😎', '🤓'] },
  { id: 'nature', icon: TreePine, label: 'Nature', emojis: ['🌺', '🌸', '🌼', '🌻'] },
  { id: 'objects', icon: Shapes, label: 'Objects', emojis: ['💻', '📱', '⌚', '📚'] },
  { id: 'symbols', icon: Sparkles, label: 'Symbols', emojis: ['❤️', '⭐', '✨', '💫'] }
]

export function EmojiPicker({ onSelect, searchQuery = '' }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('recent')
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null)

  const currentCategory = categories.find(c => c.id === activeCategory)
  const filteredEmojis = currentCategory?.emojis.filter(emoji => 
    searchQuery ? emoji.includes(searchQuery.toLowerCase()) : true
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              p-3 rounded-lg transition-all duration-300
              ${activeCategory === category.id 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <category.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {filteredEmojis?.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            onMouseEnter={() => setHoveredEmoji(emoji)}
            onMouseLeave={() => setHoveredEmoji(null)}
            className={`
              h-12 w-12 flex items-center justify-center text-xl
              bg-white rounded-lg
              transition-all duration-300 transform
              ${hoveredEmoji === emoji
                ? 'bg-gray-100 shadow-md scale-110 -translate-y-1'
                : 'hover:bg-gray-50 hover:shadow'}
            `}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
} 