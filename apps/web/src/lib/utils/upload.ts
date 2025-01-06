export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }

    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('Failed to upload image')
  }
} 