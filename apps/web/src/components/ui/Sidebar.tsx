'use client'

import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Search,
  Inbox,
  Home,
  ChevronDown,
  FolderClosed,
  LayoutGrid,
  Star,
  Users,
  Plus,
  Settings
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]

  const navigation = [
    { name: 'Inbox', href: `/${workspaceUrl}/inbox`, icon: Inbox },
    { name: 'My Issues', href: `/${workspaceUrl}/my-issues`, icon: Home },
  ]

  const workspaceNavigation = [
    { name: 'Initiatives', href: `/${workspaceUrl}/initiatives`, icon: FolderClosed },
    { name: 'Projects', href: `/${workspaceUrl}/projects`, icon: FolderClosed },
    { name: 'Views', href: `/${workspaceUrl}/views`, icon: LayoutGrid },
  ]

  const navItemClasses = 
    'flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md'

  const sectionHeaderClasses = 
    'flex items-center gap-2 px-2 py-1.5 w-full text-gray-600 hover:text-gray-900'

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Top header */}
      <div className="p-3 flex items-center gap-2 border-b border-gray-200">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-700 font-medium">98</span>
        </div>
        <span className="font-medium">9876</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-1 py-2">
          {/* Primary nav items */}
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                navItemClasses,
                pathname === item.href ? 'text-gray-900 bg-gray-100' : ''
              )}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}

          {/* Workspace section */}
          <div className="mt-6">
            <button className={sectionHeaderClasses}>
              <ChevronDown size={16} />
              <span className="text-xs font-medium uppercase">Workspace</span>
            </button>
            <div className="mt-1 space-y-1">
              {workspaceNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={navItemClasses}
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Favorites section */}
          <div className="mt-6">
            <button className={sectionHeaderClasses}>
              <ChevronDown size={16} />
              <span className="text-xs font-medium uppercase">Favorites</span>
            </button>
            <div className="mt-1">
              <Link href={`/${workspaceUrl}/starred`} className={navItemClasses}>
                <Star size={18} />
                <span className="text-sm">Starred Items</span>
              </Link>
            </div>
          </div>

          {/* Teams section */}
          <div className="mt-6">
            <button className={sectionHeaderClasses}>
              <ChevronDown size={16} />
              <span className="text-xs font-medium uppercase">Your Teams</span>
            </button>
            <div className="mt-1">
              <Link href={`/${workspaceUrl}/teams`} className={navItemClasses}>
                <Users size={18} />
                <span className="text-sm">Teams</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <Link
          href={`/${workspaceUrl}/new`}
          className={cn(navItemClasses, 'w-full')}
        >
          <Plus size={18} />
          <span className="text-sm">New Page</span>
        </Link>
        <Link
          href={`/${workspaceUrl}/settings`}
          className={cn(navItemClasses, 'w-full')}
        >
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </div>
  )
} 