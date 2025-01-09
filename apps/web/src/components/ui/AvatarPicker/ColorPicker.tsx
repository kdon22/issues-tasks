'use client'

import { useState, useEffect, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'

const defaultColors = [
  '#000000', '#FF5C38', '#2563EB', '#10B981', 
  '#F59E0B', '#EC4899', '#8B5CF6', '#6B7280'
]

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
}

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color)
  const [hexInput, setHexInput] = useState(color.replace('#', ''))
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleHexChange = (value: string) => {
    const hex = value.replace('#', '')
    setHexInput(hex)
    if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
      setCustomColor(`#${hex}`)
    }
  }

  return (
    <div 
      ref={wrapperRef}
      className="p-4"
    >
      {/* Preset colors */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {defaultColors.map(presetColor => (
          <button
            key={presetColor}
            onClick={() => {
              onChange(presetColor)
              setHexInput(presetColor.replace('#', ''))
            }}
            className={cn(
              'w-8 h-8 rounded-full border',
              color === presetColor && 'ring-2 ring-[#FF5C38]'
            )}
            style={{ backgroundColor: presetColor }}
          />
        ))}
      </div>

      {/* Custom color picker */}
      <HexColorPicker 
        color={customColor} 
        onChange={(color) => {
          setCustomColor(color)
          setHexInput(color.replace('#', ''))
        }}
        className="mb-4"
      />

      {/* Hex input */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500">#</span>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border rounded-md"
          maxLength={6}
          placeholder="000000"
        />
      </div>

      {/* Apply button */}
      <button
        onClick={() => onChange(customColor)}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-black hover:bg-[#FF5C38] rounded-md"
      >
        Apply Color
      </button>
    </div>
  )
} 