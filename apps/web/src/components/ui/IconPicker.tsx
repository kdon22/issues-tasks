'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { Tab } from '@headlessui/react'
import { PhotoIcon, MagnifyingGlassIcon, SwatchIcon, PaintBrushIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ICONS, COLORS } from '@/constants/icons'
import { EMOJIS } from '@/constants/emojis'

interface IconPickerProps {
  value: string
  color?: string
  onChange: (value: string, color?: string) => void
  onUpload?: (file: File) => Promise<void>
  label?: string
  className?: string
  showUpload?: boolean
}

export function IconPicker({ value, color = COLORS[0].value, onChange, onUpload, label, className, showUpload = true }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHexInput, setShowHexInput] = useState(false)
  const [tempColor, setTempColor] = useState(color)
  const [selectedTab, setSelectedTab] = useState(0)
  const popoverRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useOnClickOutside(popoverRef, () => {
    setIsOpen(false)
    setShowHexInput(false)
  })

  const handleColorSelect = (newColor: string) => {
    setTempColor(newColor)
    onChange(value, newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      handleColorSelect(newColor)
    }
    setTempColor(newColor)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) {
      await onUpload(file)
      setIsOpen(false)
    }
  }

  const filteredIcons = ICONS.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEmojis = EMOJIS.filter(emoji => 
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="relative" ref={popoverRef}>
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
            className
          )}
          style={{ color: tempColor }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d={value || ICONS[0].svg} />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-2 w-[320px] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <div className="relative">
                <Tab.List className="flex space-x-1 border-b border-gray-200 px-3 pt-3">
                  <Tab className={({ selected }) =>
                    cn(
                      'px-3 py-2 text-sm font-medium leading-5 focus:outline-none',
                      selected ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
                    )
                  }>
                    Icons
                  </Tab>
                  <Tab className={({ selected }) =>
                    cn(
                      'px-3 py-2 text-sm font-medium leading-5 focus:outline-none',
                      selected ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
                    )
                  }>
                    Emoji
                  </Tab>
                  {showUpload && (
                    <Tab className={({ selected }) =>
                      cn(
                        'px-3 py-2 text-sm font-medium leading-5 focus:outline-none',
                        selected ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
                      )
                    }>
                      Upload
                    </Tab>
                  )}
                </Tab.List>

                <div className="px-3 pt-3">
                  <div className="relative mb-3">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder={selectedTab === 0 ? "Search icons..." : "Search emojis..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {selectedTab === 0 && (
                    <>
                      {showHexInput ? (
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-5 h-5 rounded-md border border-gray-200"
                            style={{ backgroundColor: tempColor }}
                          />
                          <input
                            type="text"
                            value={tempColor}
                            onChange={handleHexInputChange}
                            className="flex-1 px-2 py-1 text-sm border rounded-md"
                            placeholder="#000000"
                          />
                          <button
                            onClick={() => setShowHexInput(false)}
                            className="p-1 hover:bg-gray-100 rounded-md"
                          >
                            <XMarkIcon className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {COLORS.map((colorOption) => (
                            <button
                              key={colorOption.value}
                              onClick={() => handleColorSelect(colorOption.value)}
                              className={cn(
                                "w-5 h-5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 border border-gray-200",
                                tempColor === colorOption.value && "ring-2 ring-offset-1 ring-orange-500"
                              )}
                              style={{ backgroundColor: colorOption.value }}
                              title={colorOption.name}
                            />
                          ))}
                          <button
                            onClick={() => setShowHexInput(true)}
                            className="w-5 h-5 rounded-md border border-gray-200 bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500"
                            title="Custom color"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Tab.Panels className="p-3 pt-0">
                  <Tab.Panel className="grid grid-cols-8 gap-2">
                    {filteredIcons.map((icon) => (
                      <button
                        key={icon.name}
                        onClick={() => onChange(icon.svg, tempColor)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        title={icon.name}
                        style={{ color: tempColor }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d={icon.svg} />
                        </svg>
                      </button>
                    ))}
                  </Tab.Panel>

                  <Tab.Panel className="grid grid-cols-8 gap-2">
                    {filteredEmojis.map((emoji) => (
                      <button
                        key={emoji.name}
                        onClick={() => onChange(emoji.emoji)}
                        className="p-2 hover:bg-gray-100 rounded-md text-xl"
                        title={emoji.name}
                      >
                        {emoji.emoji}
                      </button>
                    ))}
                  </Tab.Panel>

                  {showUpload && (
                    <Tab.Panel>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload an image
                        </span>
                      </button>
                    </Tab.Panel>
                  )}
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>
        )}
      </div>
    </div>
  )
} 