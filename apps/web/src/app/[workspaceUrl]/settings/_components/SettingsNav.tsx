'use client'

import { usePathname } from 'next/navigation'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { settingsNavigation } from '@/config/settings-nav'

export function SettingsNav() {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]
  const { workspace } = useWorkspace(workspaceUrl)

  if (!workspace) return null

  return (
    <nav className="space-y-8">
      {settingsNavigation.sections.map((section) => (
        <div key={section.label}>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {section.label}
          </h3>
          <div className="mt-3 space-y-1">
            {section.items.map((item) => {
              const href = `/${workspace.url}${item.href}`
              const isActive = pathname === href
              
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'block px-3 py-1 text-sm rounded-md',
                    isActive
                      ? 'bg-gray-50 text-gray-900 font-medium'
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