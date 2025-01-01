'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Transition } from '@headlessui/react'

export function SettingsSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  const settingsGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { 
          label: 'General', 
          href: `/${workspaceUrl}/settings/workspace/general` 
        },
        { 
          label: 'Members', 
          href: `/${workspaceUrl}/settings/workspace/members` 
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { 
          label: 'Profile', 
          href: `/${workspaceUrl}/settings/account/profile` 
        },
        { 
          label: 'Preferences', 
          href: `/${workspaceUrl}/settings/account/preferences` 
        },
      ],
    },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="p-4">
        <Link
          href={`/${workspaceUrl}/my-issues`}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to app
        </Link>
      </div>

      <nav className="px-2 space-y-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium',
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
} 