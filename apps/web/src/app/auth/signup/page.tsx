'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/infrastructure/trpc/core/client'
import { ErrorBoundary } from '@/domains/shared/components/feedback/ErrorBoundary'
import { SignupForm } from '@/domains/auth/components/SignupForm'


export default function SignupPage() {
  const router = useRouter()
  const { mutateAsync: signupMutation } = trpc.auth.signup.useMutation({
    onSuccess: () => {
      router.push('/auth/login')
    }
  })

  const handleSignup = async (data: {
    name: string
    email: string
    password: string
    workspaceName: string
    workspaceUrl: string
  }) => {
    await signupMutation(data)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Create Account</h1>
        <SignupForm onSubmit={handleSignup} />
      </div>
    </ErrorBoundary>
  )
} 