'use client'

import { usePathname } from 'next/navigation'
import { MAIN_NAVIGATION } from '../../constants'
import { NavLink } from '@/domains/shared/components/navigation/NavLink'
import { WorkspaceSelector } from '@/domains/workspaces/components/WorkspaceSelector'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { 
  InboxIcon,
  ViewColumnsIcon,
  UsersIcon,
  FlagIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

export function MainNav() {
  const pathname = usePathname()
  const workspaceUrl = pathname.split('/')[1]

  const navigationSections = [
    {
      items: [
        { name: 'Inbox', href: `/${workspaceUrl}/inbox`, icon: InboxIcon },
        { name: 'My Issues', href: `/${workspaceUrl}/my-issues`, icon: ViewColumnsIcon },
      ]
    },
    {
      name: 'Workspace',
      items: [
        { name: 'Projects', href: `/${workspaceUrl}/projects`, icon: ViewColumnsIcon },
        { name: 'Teams', href: `/${workspaceUrl}/teams`, icon: UsersIcon },
      ]
    },
    {
      name: 'Flags',
      items: [
        { name: 'Blocked', href: `/${workspaceUrl}/flags/blocked`, icon: FlagIcon },
        { name: 'At Risk', href: `/${workspaceUrl}/flags/at-risk`, icon: FlagIcon },
        { name: 'On Track', href: `/${workspaceUrl}/flags/on-track`, icon: FlagIcon },
      ]
    },
    {
      name: 'Favorites',
      items: [
        { name: 'Starred', href: `/${workspaceUrl}/starred`, icon: StarIcon },
      ]
    }
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header with Workspace and Actions */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <WorkspaceSelector workspace={{ id: workspaceUrl, name: workspaceUrl, url: workspaceUrl }} />
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {/* TODO: Open search modal */}}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          <button className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navigationSections.map((section, index) => (
          <div key={section.name || index} className="mb-6">
            {section.name && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.name}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink href={item.href}>
                    <div className="flex items-center">
                      {item.icon && (
                        <item.icon 
                          className="mr-3 h-4 w-4" 
                          aria-hidden="true" 
                        />
                      )}
                      {item.name}
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )
} 