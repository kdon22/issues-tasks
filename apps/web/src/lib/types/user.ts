interface User {
  id: string
  name: string | null
  email: string
  avatarType: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE'
  avatarIcon: string | null
  avatarColor: string | null
  avatarEmoji: string | null
  avatarImageUrl: string | null
  nickname: string | null
} 