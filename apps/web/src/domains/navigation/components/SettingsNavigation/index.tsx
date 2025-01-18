'use client'

import type { NavigationSection } from '../../types'
import { NavItem } from '../MainNav/NavItem'

interface SettingsNavigationProps {
  sections: NavigationSection[]
  className?: string
}

export function SettingsNavigation({ sections, className }: SettingsNavigationProps) {
  return (
    <nav className={className}>
      {sections.map((section) => (
        <div key={section.name} className="space-y-1">
          {section.name && (
            <h3 className="px-3 text-sm font-medium text-gray-500">
              {section.name}
            </h3>
          )}
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                label={item.name}
                href={item.href}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
} 