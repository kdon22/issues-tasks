'use client'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface EmojiPickerProps {
  searchTerm: string
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ searchTerm, onSelect }: EmojiPickerProps) {
  return (
    <Picker 
      data={data} 
      theme="light"
      onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
      previewPosition="none"
      skinTonePosition="none"
      searchPosition="none"
      navPosition="bottom"
      perLine={9}
      maxFrequentRows={0}
      noResultsEmoji="cry"
      searchString={searchTerm}
      set="native"
      showSkinTones={false}
      emojiSize={32}
      emojiButtonSize={40}
      categories={['people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags']}
      style={{ 
        border: 'none',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        width: '100%'
      }}
    />
  )
} 