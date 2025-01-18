'use client'

interface ImageUploaderProps {
  onUpload: (url: string) => void
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const { url } = await res.json()
    onUpload(url)
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="avatar-upload"
      />
      <label 
        htmlFor="avatar-upload"
        className="block w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500"
      >
        Click to upload image
      </label>
    </div>
  )
} 