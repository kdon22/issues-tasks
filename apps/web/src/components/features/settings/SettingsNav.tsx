'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { cn } from '@/lib/utils'

const settingsNavigation = {
  sections: [
    {
      label: 'WORKSPACE',
      items: [
        { label: 'General', href: '/settings/workspace/general' },
        { label: 'Teams', href: '/settings/workspace/teams' },
        { label: 'Members', href: '/settings/workspace/members' }
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { label: 'Profile', href: '/settings/account' },
        { label: 'Preferences', href: '/settings/preferences' }
      ]
    }
  ]
}

export function SettingsNav() {
  const pathname = usePathname()
  const { workspace } = useWorkspace()

  if (!workspace) return null

  return (
    <nav className="space-y-6">
      {settingsNavigation.sections.map((section) => (
        <div key={section.label}>
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {section.label}
          </h3>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const href = `/${workspace.url}${item.href}`
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'block px-2 py-1.5 text-sm rounded-md',
                    pathname === href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
} 