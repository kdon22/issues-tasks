'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { slugify } from '@/lib/utils'

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    workspaceName: '', // Added workspace name field
  })
  const [error, setError] = useState('')

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      if (data.redirectTo) {
        window.location.href = data.redirectTo
      }
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.workspaceName.trim()) {
      setError('Workspace name is required')
      return
    }

    try {
      await signupMutation.mutate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        workspace: {
          name: formData.workspaceName.trim(),
          url: slugify(formData.workspaceName),
        },
      })
    } catch (error) {
      console.error('Signup error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              label="Workspace Name"
              type="text"
              value={formData.workspaceName}
              onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
              placeholder="My Team's Workspace"
              required
            />

            {formData.workspaceName && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Your workspace URL will be: issuestasks.com/{slugify(formData.workspaceName)}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={signupMutation.isLoading}
          >
            {signupMutation.isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </div>
    </div>
  )
} 