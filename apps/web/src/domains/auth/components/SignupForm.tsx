'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input, Button } from '@/domains/shared/components/inputs'
import { validateEmail, validatePassword } from '../utils/validation'
import { trpc } from '@/infrastructure/trpc/core/client'

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState('')

  const { mutate: signup, isLoading } = trpc.auth.signup.useMutation({
    onSuccess: () => router.push('/auth/login'),
    onError: (err) => setError(err.message || 'Something went wrong')
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      workspaceName: formData.get('workspaceName') as string,
      workspaceUrl: formData.get('workspaceUrl') as string
    }

    const emailError = validateEmail(data.email)
    const passwordError = validatePassword(data.password)
    if (emailError || passwordError) {
      setError(emailError || passwordError || '')
      return
    }

    signup(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        autoComplete="name"
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />

      <Input
        label="Workspace Name"
        name="workspaceName"
        required
      />

      <Input
        label="Workspace URL"
        name="workspaceUrl"
        required
        pattern="[a-z0-9-]+"
        helperText="Lowercase letters, numbers and hyphens only"
      />

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-primary hover:text-primary-dark font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
} 