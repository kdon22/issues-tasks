'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  ChevronDown, 
  Settings, 
  Users, 
  LogOut,
  Download,
  SwitchHorizontal,
} from 'lucide-react'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { api } from '@/lib/trpc/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

export function WorkspaceSwitcher() {
  const router = useRouter()
  const { workspace } = useWorkspace(window.location.pathname.split('/')[1])
  const { data: workspaces } = api.workspace.list.useQuery()

  if (!workspace) return null

  const menuItemClasses = 
    'flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-md">
        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
          <span className="text-blue-700 font-medium">{workspace.name.substring(0, 2).toUpperCase()}</span>
        </div>
        <span className="font-medium">{workspace.name}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-1 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
          {/* Settings */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/${workspace.url}/settings/workspace/general`}
                  className={menuItemClasses}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </div>
                  <kbd className="text-xs text-gray-400">G then S</kbd>
                </Link>
              )}
            </Menu.Item>
          </div>

          {/* Members */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/${workspace.url}/settings/workspace/members`}
                  className={menuItemClasses}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Invite and manage members</span>
                  </div>
                </Link>
              )}
            </Menu.Item>
          </div>

          {/* Desktop App */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button className={menuItemClasses}>
                  <div className="flex items-center gap-2">
                    <Download size={16} />
                    <span>Download desktop app</span>
                  </div>
                </button>
              )}
            </Menu.Item>
          </div>

          {/* Switch Workspace */}
          {workspaces && workspaces.length > 1 && (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button className={menuItemClasses}>
                    <div className="flex items-center gap-2">
                      <SwitchHorizontal size={16} />
                      <span>Switch workspace</span>
                    </div>
                    <kbd className="text-xs text-gray-400">O then W</kbd>
                  </button>
                )}
              </Menu.Item>
              <div className="px-3 py-2 space-y-1">
                {workspaces.map((ws) => (
                  <Menu.Item key={ws.id}>
                    {({ active }) => (
                      <Link
                        href={`/${ws.url}/my-issues`}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 text-sm rounded-md',
                          active ? 'bg-gray-100' : ''
                        )}
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                          <span className="text-blue-700 text-xs font-medium">
                            {ws.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-700">{ws.name}</span>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className={menuItemClasses}
                >
                  <div className="flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Log out</span>
                  </div>
                  <kbd className="text-xs text-gray-400">⌃⇧Q</kbd>
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 