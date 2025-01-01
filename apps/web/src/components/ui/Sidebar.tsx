'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WorkspaceDropdown } from './WorkspaceDropdown'
import { trpc } from '@/lib/trpc/client'
import { Logo } from './Logo'
import {
  HomeIcon,
  InboxIcon,
  ListBulletIcon,
  ViewColumnsIcon,
  FolderIcon,
  StarIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Inbox', href: '/inbox', icon: InboxIcon },
  { name: 'My Issues', href: '/my-issues', icon: HomeIcon },
]

const workspaceNavigation = [
  { name: 'Initiatives', href: '/initiatives', icon: ViewColumnsIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Views', href: '/views', icon: ListBulletIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: workspace } = trpc.workspace.getCurrent.useQuery()
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true)

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="px-4">
          <WorkspaceDropdown />
        </div>

        {/* Search */}
        <div className="px-4 mt-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 text-sm bg-gray-100 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="mt-6 flex-1 px-2 space-y-8">
          {/* Primary Nav */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const href = `/${workspace?.url}${item.href}`
              const isActive = pathname === href
              
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Workspace Section */}
          <div>
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <span>Workspace</span>
                <svg
                  className={`ml-1 h-5 w-5 transform ${isWorkspaceOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {isWorkspaceOpen && (
              <div className="mt-1 space-y-1">
                {workspaceNavigation.map((item) => {
                  const href = `/${workspace?.url}${item.href}`
                  const isActive = pathname === href
                  
                  return (
                    <Link
                      key={item.name}
                      href={href}
                      className={`${
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md ml-3`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Favorites Section */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Favorites
            </h3>
            <div className="mt-1 space-y-1">
              <Link
                href="#"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <StarIcon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                Starred Items
              </Link>
            </div>
          </div>

          {/* Teams Section */}
          <div>
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Teams
            </h3>
            <div className="mt-1 space-y-1">
              <Link
                href="#"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <UsersIcon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                {workspace?.name}
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Settings Link */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <Link
          href={`/${workspace?.url}/settings`}
          className="group flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 w-full"
        >
          <Cog6ToothIcon
            className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          Settings
        </Link>
      </div>
    </div>
  )
} 