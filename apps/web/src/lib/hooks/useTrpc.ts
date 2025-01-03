import { api } from '@/lib/trpc/client'
import { useEffect } from 'react'

export function useTrpcHealth() {
  const health = api.health.check.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    if (health.error) {
      console.error('TRPC Health Check Failed:', health.error)
    }
  }, [health.error])

  return health
} 