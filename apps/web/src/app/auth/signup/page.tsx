'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { stringToColor } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [error, setError] = useState('')

  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      router.push('/auth/login')
    },
    onError: (error) => {
      // Parse the error message if it's a JSON string
      try {
        const parsedError = JSON.parse(error.message)
        if (Array.isArray(parsedError)) {
          setError(parsedError[0].message)
        } else {
          setError(error.message)
        }
      } catch {
        setError(error.message)
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await signup.mutateAsync({
        name,
        email,
        password,
        workspaceName,
      })
    } catch (err) {
      // Error is handled by onError above
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700">
                Workspace Name
              </label>
              <Input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Your workspace URL will be: issuetasks.com/{workspaceName}
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              loading={signup.isLoading}
              disabled={signup.isLoading}
            >
              {signup.isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 