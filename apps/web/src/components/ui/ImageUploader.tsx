'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageIcon, UploadIcon } from 'lucide-react'

interface ImageUploaderProps {
  onUpload: (imageUrl: string) => void
  className?: string
}

export function ImageUploader({ onUpload, className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const { url } = await response.json()
      onUpload(url)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed p-4 transition-colors',
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
        className
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
      }}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />
      <div className="flex flex-col items-center justify-center text-gray-500">
        {isUploading ? (
          <UploadIcon className="w-8 h-8 mb-2 animate-bounce" />
        ) : (
          <ImageIcon className="w-8 h-8 mb-2" />
        )}
        <span className="text-sm">
          {isUploading
            ? 'Uploading...'
            : 'Drop an image here or click to upload'}
        </span>
      </div>
    </div>
  )
} 