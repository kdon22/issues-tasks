interface AvatarProps {
  type: 'EMOJI' | 'ICON' | 'IMAGE' | 'INITIALS'
  emoji?: string
  icon?: string
  imageUrl?: string
  initials?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ 
  type,
  emoji,
  icon,
  imageUrl,
  initials,
  color = '#000000',
  size = 'md',
  className
}: AvatarProps) {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }[size]

  const baseClass = `rounded-full flex items-center justify-center ${sizeClass} ${className || ''}`

  switch (type) {
    case 'EMOJI':
      return <div className={baseClass}>{emoji}</div>
    case 'ICON':
      return <div className={baseClass} style={{ backgroundColor: color }}>{icon}</div>
    case 'IMAGE':
      return <img src={imageUrl} alt="" className={baseClass} />
    case 'INITIALS':
      return <div className={baseClass} style={{ backgroundColor: color }}>{initials}</div>
    default:
      return null
  }
} 