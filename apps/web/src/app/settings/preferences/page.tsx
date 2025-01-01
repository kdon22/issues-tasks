'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function PreferencesPage() {
  const { data: preferences, isLoading } = trpc.user.getPreferences.useQuery()
  const updatePreferences = trpc.user.updatePreferences.useMutation()

  const [formData, setFormData] = useState({
    defaultHomeView: preferences?.defaultHomeView || 'active-issues',
    displayFullNames: preferences?.displayFullNames || true,
    firstDayOfWeek: preferences?.firstDayOfWeek || 'Monday',
    useEmoticons: preferences?.useEmoticons || true,
    fontSize: preferences?.fontSize || 'default',
    usePointerCursor: preferences?.usePointerCursor || true,
    interfaceTheme: preferences?.interfaceTheme || 'system',
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Preferences</h1>

      <div className="space-y-8">
        {/* General Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">General</h2>
          
          <div className="space-y-6">
            {/* Default Home View */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default home view
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Which view is opened when you open up IssuesTasks
              </p>
              <select
                value={formData.defaultHomeView}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, defaultHomeView: e.target.value }))
                  updatePreferences.mutate({ defaultHomeView: e.target.value })
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="active-issues">Active Issues</option>
                <option value="my-issues">My Issues</option>
                <option value="inbox">Inbox</option>
              </select>
            </div>

            {/* Display Full Names */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Display full names</h3>
                <p className="text-sm text-gray-500">
                  Show full names of users instead of shorter usernames
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, displayFullNames: !prev.displayFullNames }))
                  updatePreferences.mutate({ displayFullNames: !formData.displayFullNames })
                }}
                className={`
                  relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer 
                  transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  ${formData.displayFullNames ? 'bg-primary' : 'bg-gray-200'}
                `}
              >
                <span className={`
                  pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 
                  transition ease-in-out duration-200
                  ${formData.displayFullNames ? 'translate-x-5' : 'translate-x-0'}
                `} />
              </button>
            </div>

            {/* Similar toggle components for other boolean settings */}
            {/* Add other preference controls here */}
          </div>
        </section>
      </div>
    </div>
  )
} 