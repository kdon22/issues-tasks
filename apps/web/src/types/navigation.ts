export interface NavigationItem {
  label: string
  href: string
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

export interface SettingsNavigation {
  sections: NavigationSection[]
} 