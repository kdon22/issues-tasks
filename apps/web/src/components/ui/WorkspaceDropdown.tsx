'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { api } from '@/lib/trpc/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Workspace } from '@/lib/types/workspace'
import { EntityAvatar } from '@/components/ui/EntityAvatar'

export function WorkspaceDropdown() {
  const router = useRouter()
  const { data: currentWorkspace } = api.workspace.getCurrent.useQuery({
    url: window.location.pathname.split('/')[1]
  })
  const { data: workspaces } = api.workspace.list.useQuery()

  const handleLogout = async () => {
    // Add logout logic here
    router.push('/auth/login')
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center gap-2">
          {currentWorkspace?.id && (
            <EntityAvatar type="workspace" id={currentWorkspace.id} size="sm" />
          )}
          <span>{currentWorkspace?.name}</span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/${currentWorkspace?.url}/settings/workspace/general`}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Settings
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/${currentWorkspace?.url}/settings/workspace/members`}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block px-4 py-2 text-sm`}
                >
                  Invite and manage members
                </Link>
              )}
            </Menu.Item>

            <div className="border-t border-gray-100 my-1" />
            
            <div className="px-4 py-2">
              <div className="text-xs font-semibold text-gray-500">
                Switch Workspace
              </div>
              <div className="mt-2 space-y-1">
                {workspaces?.map((workspace: Workspace) => (
                  <Menu.Item key={workspace.id}>
                    {({ active }) => (
                      <Link
                        href={`/${workspace.url}/my-issues`}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-2 py-2 text-sm rounded-md`}
                      >
                        {workspace.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/workspace/new"
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } block px-2 py-2 text-sm rounded-md`}
                    >
                      Create or join a workspace
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </div>

            <div className="border-t border-gray-100 my-1" />
            
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } block w-full text-left px-4 py-2 text-sm`}
                >
                  Log out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 