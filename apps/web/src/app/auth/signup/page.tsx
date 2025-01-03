'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { stringToColor, slugify } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [error, setError] = useState('')

  const signup = api.auth.signup.useMutation({
    onSuccess: () => {
      router.push('/auth/login')
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      await signup.mutateAsync({
        name,
        email,
        password,
        workspaceName,
        workspaceUrl: slugify(workspaceName)
      })
    } catch (err) {
      // Error is handled by onError above
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <Input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your workspace URL will be: issuetasks.com/{workspaceName && slugify(workspaceName)}
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

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{' '}
              <Link 
                href="/auth/login" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 