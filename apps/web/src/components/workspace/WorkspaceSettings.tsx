'use client'

import { useState, Fragment } from 'react'
import { useParams } from 'next/navigation'
import { GeneralSettings } from './GeneralSettings'
import { api } from '@/lib/trpc/client'
import { Transition } from '@headlessui/react'

export function WorkspaceSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'billing'>('general')
  const params = useParams()
  if (!params?.workspaceUrl) return null
  
  const workspaceUrl = params.workspaceUrl as string

  const { data: workspaces } = api.workspace.list.useQuery(undefined, {
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch workspaces:', error)
    }
  })

  const { data: workspace, isLoading, error } = api.workspace.getCurrent.useQuery(
    { url: workspaceUrl },
    { 
      enabled: !!workspaceUrl && !!workspaces,
      retry: false
    }
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error?.message === 'UNAUTHORIZED') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p>You need to be logged in to view workspace settings</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error loading workspace settings</div>
  }

  if (!workspace) return null

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Workspace Settings
      </h1>

      <div className="flex gap-8">
        <div className="w-48">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              General
            </button>
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'general' && (
            <Transition
              as={Fragment}
              show={true}
              appear={true}
              enter="transition-opacity duration-75"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div>
                <GeneralSettings workspace={workspace} />
              </div>
            </Transition>
          )}
        </div>
      </div>
    </div>
  )
} 