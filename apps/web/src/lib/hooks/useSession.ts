import { useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'

export function useSession() {
  const utils = trpc.useContext()
  const refreshMutation = trpc.auth.refresh.useMutation()

  useEffect(() => {
    const refreshSession = async () => {
      try {
        await refreshMutation.mutateAsync()
      } catch (error) {
        // Handle session expiry
        window.location.href = '/login'
      }
    }

    // Refresh session every 15 minutes
    const interval = setInterval(refreshSession, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshMutation])
} 