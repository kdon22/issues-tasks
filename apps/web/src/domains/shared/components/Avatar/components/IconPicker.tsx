'use client'

import { ColorPicker } from './ColorPicker'
import { 
  Heart, Star, Sun, Moon, Cloud, Zap, Camera, Music, Video, Coffee,
  Settings, Home, User, Bell, Calendar, Clock, Map, Mail, Phone, Search,
  Send, Share, Shield, Smile, Speaker, Tag, Target, Trash, Truck,
  Tv, Umbrella, Upload, Users, Volume, Wallet, Watch, Wifi, Wind, X, ZoomIn,
  Award, Anchor, Archive, ArrowUp, AtSign, Axe, Baby, Backpack, Badge
} from 'lucide-react'

interface IconPickerProps {
  selectedColor: string
  onSelect: (iconName: string) => void
  onColorChange: (color: string) => void
}

const icons = [
  { component: Heart, value: Heart }, 
  { component: Star, value: Star },
  { component: Sun, value: Sun },
  { component: Moon, value: Moon },
  { component: Cloud, value: Cloud },
  { component: Zap, value: Zap },
  // Add remaining icons
]

export function IconPicker({ selectedColor, onSelect, onColorChange }: IconPickerProps) {
  return (
    <div className="space-y-4">
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        showHexInput
      />
      <div className="grid grid-cols-8 gap-1">
        {icons.map(({ value: Icon }) => (
          <button
            key={Icon.displayName || Icon.name}
            onClick={() => onSelect(Icon)}
            className="aspect-square p-1"
          >
            <Icon className="w-4 h-4" color={`#${selectedColor}`} />
          </button>
        ))}
      </div>
    </div>
  )
} 