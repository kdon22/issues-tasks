'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { slugify } from '@/lib/utils'

export function WorkspaceCreationForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const createMutation = trpc.workspace.create.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = `/${data.url}/my-issues`
      }
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Workspace name is required')
      return
    }

    try {
      await createMutation.mutate({
        name: name.trim(),
        url: slugify(name),
      })
    } catch (error) {
      console.error('Creation error:', error)
    }
  }

  const slugifiedUrl = name ? slugify(name) : ''

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create a new workspace
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          A workspace is where you and your team manage projects and collaborate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Workspace name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Workspace URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                issuestasks.com/
              </span>
              <input
                id="url"
                type="text"
                value={slugifiedUrl}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                readOnly
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isLoading || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create workspace'}
          </button>
        </div>
      </form>
    </div>
  )
} 