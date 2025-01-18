'use client'

import { useEffect } from 'react'
import { Button } from '@/domains/shared/components/inputs'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  )
} 