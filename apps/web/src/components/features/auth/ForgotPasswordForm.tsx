'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { validateEmail } from '@/lib/utils/validation'

export function ForgotPasswordForm() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setIsLoading(false)
      return
    }
    
    try {
      // We'll implement password reset later
      setIsSuccess(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Check your email
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent password reset instructions to your email address.
        </p>
        <Link 
          href="/auth/login"
          className="text-orange-600 hover:text-orange-500 font-medium"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Reset your password
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={error}
        />

        <Button 
          type="submit"
          loading={isLoading}
          className="w-full"
        >
          Send reset instructions
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <Link 
          href="/auth/login"
          className="text-orange-600 hover:text-orange-500 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
} 