import type { LucideIcon } from 'lucide-react'

export interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export interface Tab {
  id: string
  icon: LucideIcon
  label: string
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
} 