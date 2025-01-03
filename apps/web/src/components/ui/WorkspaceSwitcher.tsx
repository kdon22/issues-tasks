'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  ChevronDown, 
  Settings, 
  Users, 
  LogOut,
  UserCircle,
  Sliders,
  Building,
  UserPlus
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
    'flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md w-full text-left'

  const sectionHeaderClasses =
    'px-2 py-1.5 text-xs font-medium text-gray-500 uppercase'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 rounded-md">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-700 font-medium">98</span>
        </div>
        <span className="font-medium">9876</span>
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
        <Menu.Items className="absolute left-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* Workspace Settings */}
            <div className={sectionHeaderClasses}>
              Workspace Settings
            </div>
            <div className="px-2 py-1 space-y-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/${workspace.url}/settings/workspace/general`}
                    className={cn(menuItemClasses, active && 'bg-gray-100')}
                  >
                    <Building size={16} />
                    <span>General</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/${workspace.url}/settings/workspace/members`}
                    className={cn(menuItemClasses, active && 'bg-gray-100')}
                  >
                    <Users size={16} />
                    <span>Members</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/${workspace.url}/settings/workspace/members/invite`}
                    className={cn(menuItemClasses, active && 'bg-gray-100')}
                  >
                    <UserPlus size={16} />
                    <span>Invite members</span>
                  </Link>
                )}
              </Menu.Item>
            </div>

            {/* Personal Settings */}
            <div className="mt-4">
              <div className={sectionHeaderClasses}>
                Personal Settings
              </div>
              <div className="px-2 py-1 space-y-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={`/${workspace.url}/settings/account/profile`}
                      className={cn(menuItemClasses, active && 'bg-gray-100')}
                    >
                      <UserCircle size={16} />
                      <span>Profile</span>
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={`/${workspace.url}/settings/account/preferences`}
                      className={cn(menuItemClasses, active && 'bg-gray-100')}
                    >
                      <Sliders size={16} />
                      <span>Preferences</span>
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </div>

            {/* Workspace Switcher */}
            {workspaces && workspaces.length > 1 && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <div className={sectionHeaderClasses}>
                  Switch Workspace
                </div>
                <div className="px-2 py-1 space-y-1">
                  {workspaces.map((ws) => (
                    <Menu.Item key={ws.id}>
                      {({ active }) => (
                        <Link
                          href={`/${ws.url}/my-issues`}
                          className={cn(
                            menuItemClasses,
                            active && 'bg-gray-100',
                            workspace.id === ws.id && 'bg-gray-50'
                          )}
                        >
                          <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-700 text-xs">{ws.name[0]}</span>
                          </div>
                          {ws.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </>
            )}

            {/* Logout */}
            <div className="border-t border-gray-200 my-2">
              <div className="px-2 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      className={cn(menuItemClasses, active && 'bg-gray-100')}
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 