'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { 
  UserIcon, 
  AdjustmentsHorizontalIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { label: 'Profile', href: '/settings/account/profile', icon: UserIcon },
  { label: 'Preferences', href: '/settings/account/preferences', icon: AdjustmentsHorizontalIcon },
  { label: 'Notifications', href: '/settings/account/notifications', icon: BellIcon },
  { label: 'Security', href: '/settings/account/security', icon: ShieldCheckIcon }
]

export function AccountSettingsNav() {
  const params = useParams<{ workspaceUrl: string }>()
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 border-b border-gray-200">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={`/${params.workspaceUrl}${item.href}`}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
            pathname.includes(item.href) 
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
} 