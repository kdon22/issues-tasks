import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon?: LucideIcon
  current?: boolean
  children?: NavigationItem[]
}

export interface NavigationSection {
  name?: string
  items: NavigationItem[]
}

export interface SettingsNavigation {
  sections: NavigationSection[]
} 