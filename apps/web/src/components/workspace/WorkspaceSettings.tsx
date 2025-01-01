'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { GeneralSettings } from './GeneralSettings'
import { trpc } from '@/lib/trpc/client'

type Tab = 'general' | 'members' | 'billing'

export function WorkspaceSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const params = useParams()
  const workspaceUrl = params.workspaceUrl as string

  const { data: workspace } = trpc.workspace.getByUrl.useQuery(
    { url: workspaceUrl },
    { enabled: !!workspaceUrl }
  )

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
            {/* Add more tabs as needed */}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'general' && <GeneralSettings />}
        </div>
      </div>
    </div>
  )
} 