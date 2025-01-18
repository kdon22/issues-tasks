import { Avatar } from './Avatar'

interface AvatarDisplayProps {
  value: string  // Format: emoji | icon:color | initials:color | imageUrl
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarDisplay({ value, size = 'md', className }: AvatarDisplayProps) {
  // Parse the avatar string
  if (value.includes(':')) {
    const [content, color] = value.split(':')
    if (content.length <= 2) {
      // Initials with color
      return <Avatar type="INITIALS" initials={content} color={color} size={size} className={className} />
    }
    // Icon with color
    return <Avatar type="ICON" icon={content} color={color} size={size} className={className} />
  }

  // Check if value is a URL
  if (value.startsWith('http')) {
    return <Avatar type="IMAGE" imageUrl={value} size={size} className={className} />
  }

  // Assume emoji
  return <Avatar type="EMOJI" emoji={value} size={size} className={className} />
} 