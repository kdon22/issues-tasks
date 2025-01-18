import { useEffect } from 'react'
import { trpc } from '@/infrastructure/trpc/core/client'

export function useErrorBoundary() {
  const utils = trpc.useContext()

  useEffect(() => {
    const unhandledError = (event: ErrorEvent) => {
      // Log error to monitoring service
      console.error('Unhandled error:', event.error)
      
      // Invalidate potentially stale queries
      utils.invalidate()
    }

    window.addEventListener('error', unhandledError)
    return () => window.removeEventListener('error', unhandledError)
  }, [])

  return {
    reset: () => utils.invalidate(),
    clearCache: () => utils.invalidate()
  }
} 