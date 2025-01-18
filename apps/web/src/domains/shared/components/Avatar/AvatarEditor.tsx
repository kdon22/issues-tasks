'use client'

import { useState } from 'react'
import { ImageIcon, Smile, Upload, Trash2 } from 'lucide-react'
import { EmojiPicker, IconPicker, ImageUploader } from './components'
import type { AvatarData } from '@/domains/shared/types/avatar'
import type { AvatarType } from '@prisma/client'

interface Props {
  data: AvatarData
  onChange: (data: AvatarData) => void
}

const tabs = [
  { id: 'ICON', icon: ImageIcon, label: 'Icon' },
  { id: 'EMOJI', icon: Smile, label: 'Emoji' },
  { id: 'IMAGE', icon: Upload, label: 'Upload' }
]

export function AvatarEditor({ data, onChange }: Props) {
  const [selectedType, setSelectedType] = useState<AvatarType>(data.type)
  const [selectedColor, setSelectedColor] = useState(data.color.replace('#', ''))

  return (
    <div className="w-[480px] bg-white rounded-xl shadow-lg">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Choose Icon</h2>
          <button
            onClick={() => onChange({ ...data, type: 'INITIALS' })}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as AvatarType)}
              className={`
                flex-1 p-2 rounded-md flex items-center justify-center gap-2
                ${selectedType === tab.id ? 'bg-black text-white' : 'text-gray-600'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {selectedType === 'ICON' && (
          <IconPicker
            selectedColor={selectedColor}
            onSelect={(value) => {
              onChange({
                ...data,
                type: 'ICON',
                value,
                color: `#${selectedColor}`
              })
            }}
            onColorChange={setSelectedColor}
          />
        )}
        {selectedType === 'EMOJI' && (
          <EmojiPicker
            onSelect={(value) => onChange({ ...data, type: 'EMOJI', value })}
          />
        )}
        {selectedType === 'IMAGE' && (
          <ImageUploader
            onUpload={(value) => onChange({ ...data, type: 'IMAGE', value })}
          />
        )}
      </div>
    </div>
  )
} 