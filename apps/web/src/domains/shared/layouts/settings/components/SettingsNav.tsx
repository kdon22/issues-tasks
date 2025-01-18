'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/domains/shared/utils/cn'
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  UserGroupIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const settingsNavigation = {
  workspace: [
    { name: 'General', href: '/settings/workspace/general', icon: BuildingOfficeIcon },
    { name: 'Members', href: '/settings/workspace/members', icon: UsersIcon },
    { name: 'Teams', href: '/settings/workspace/teams', icon: UserGroupIcon }
  ],
  account: [
    { name: 'Profile', href: '/settings/account/profile', icon: UserIcon },
    { name: 'Preferences', href: '/settings/account/preferences', icon: AdjustmentsHorizontalIcon },
    { name: 'Notifications', href: '/settings/account/notifications', icon: BellIcon },
    { name: 'Security', href: '/settings/account/security', icon: ShieldCheckIcon }
  ]
}

export function SettingsNav() {
  console.log('SettingsNav rendering')
  const params = useParams<{ workspaceUrl: string }>()
  const pathname = usePathname()
  console.log('SettingsNav pathname:', pathname)

  return (
    <nav className="space-y-8">
      <div>
        <h3 className="px-3 text-sm font-medium text-gray-500">Workspace</h3>
        <div className="mt-2 space-y-1">
          {settingsNavigation.workspace.map(item => (
            <Link
              key={item.href}
              href={`/${params.workspaceUrl}${item.href}`}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                pathname.includes(item.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="px-3 text-sm font-medium text-gray-500">Account</h3>
        <div className="mt-2 space-y-1">
          {settingsNavigation.account.map(item => (
            <Link
              key={item.href}
              href={`/${params.workspaceUrl}${item.href}`}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                pathname.includes(item.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 