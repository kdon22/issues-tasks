export const ICONS = [
  'home',
  'user',
  'settings',
  'bell',
  'calendar',
  'folder',
  'document',
  'chart',
  'mail',
  'chat',
  'star',
  'heart',
  'bookmark',
  'flag',
  'tag',
  'lightning',
  'key',
  'lock',
  'shield',
  'globe',
] as const

export type IconName = typeof ICONS[number] 