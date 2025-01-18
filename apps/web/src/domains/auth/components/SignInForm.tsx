'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/domains/shared/components/inputs'
import { Button } from '@/domains/shared/components/inputs'
import { validateEmail, validatePassword } from '../utils/validation'

export function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError || passwordError) {
      setError(emailError || passwordError || '')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (!result?.ok) {
        setError('Invalid email or password')
        return
      }

      router.refresh()
      router.push('/')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        autoComplete="current-password"
        required
      />

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Sign in
      </Button>

      <div className="flex items-center justify-between">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Forgot password?
        </Link>
        <Link
          href="/auth/signup"
          className="text-sm text-primary hover:text-primary-dark"
        >
          Create account
        </Link>
      </div>
    </form>
  )
} 