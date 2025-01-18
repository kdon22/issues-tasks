'use client'

import { useState } from 'react'
import { Input, Button } from '@/domains/shared/components/inputs'
import Link from 'next/link'
import { validateEmail } from '../utils/validation'
import { trpc } from '@/infrastructure/trpc/core/client'

export function ForgotPasswordForm() {
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const { mutate: sendResetEmail, isLoading } = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setIsSuccess(true),
    onError: () => setError('Something went wrong. Please try again.')
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    
    sendResetEmail({ email })
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Check your email
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent password reset instructions to your email address.
        </p>
        <Link 
          href="/auth/login"
          className="text-primary hover:text-primary-dark font-medium"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">
        Reset your password
      </h1>
      <p className="text-gray-600 mb-6">
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

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link 
            href="/auth/login"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
} 