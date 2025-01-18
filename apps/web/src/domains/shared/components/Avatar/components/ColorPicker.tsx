'use client'

import { Pipette } from 'lucide-react'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  showHexInput?: boolean
  onHexInputToggle?: () => void
  customColor?: string
  onCustomColorChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ColorPicker({ selectedColor, onColorChange, showHexInput }: ColorPickerProps) {
  const colors = [
    '000000', '6B7280', 'EF4444', 'F59E0B',
    '10B981', '3B82F6', '8B5CF6', 'EC4899'
  ]

  return (
    <div className="flex items-center gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`w-6 h-6 rounded-md transition-all duration-200 hover:scale-110
            ${selectedColor === color ? 'ring-2 ring-gray-900 ring-offset-1' : ''}`}
          style={{ backgroundColor: `#${color}` }}
        />
      ))}
      {showHexInput && (
        <button className="w-6 h-6 rounded-md bg-gray-50 border border-gray-200 
                        flex items-center justify-center">
          <Pipette className="w-3.5 h-3.5 text-gray-600" />
        </button>
      )}
    </div>
  )
} 