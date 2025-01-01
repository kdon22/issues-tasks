'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export default function JoinWorkspacePage() {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  const joinMutation = trpc.workspace.join.useMutation({
    onSuccess: (workspace) => {
      window.location.href = `/${workspace.url}/my-issues`
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await joinMutation.mutate({ inviteCode: inviteCode.trim() })
    } catch (error) {
      console.error('Join error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join a workspace
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700">
              Invite Code
            </label>
            <input
              id="invite-code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={joinMutation.isLoading || !inviteCode.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {joinMutation.isLoading ? 'Joining...' : 'Join Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 