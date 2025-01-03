'use client'

import { usePathname } from 'next/navigation'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { settingsNavigation } from '@/config/settings-nav'

export function SettingsNav() {
  const pathname = usePathname() || ''
  const workspaceUrl = pathname.split('/')[1] || ''
  const { workspace } = useWorkspace(workspaceUrl)

  if (!workspace) return null

  return (
    <nav className="space-y-8">
      {settingsNavigation.map((section) => (
        <div key={section.title}>
          <h3 className="px-3 text-sm font-medium text-gray-500 uppercase">
            {section.title}
          </h3>
          <div className="mt-3 space-y-1">
            {section.items.map((item) => {
              const isActive = pathname.startsWith(`/${workspaceUrl}/settings/${item.href}`)
              return (
                <Link
                  key={item.href}
                  href={`/${workspaceUrl}/settings/${item.href}`}
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