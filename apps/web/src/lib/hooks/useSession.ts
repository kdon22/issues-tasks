'use client'

import { useEffect, useCallback } from 'react'
import { api } from '@/lib/trpc/client'
import type { Session } from '@/lib/types/session'

export function useSession() {
  const utils = api.useContext()
  
  // Query session with enabled caching and revalidation
  const { 
    data: session, 
    isLoading,
    refetch: refetchSession 
  } = api.auth.getSession.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  })

  // Improved refresh mutation with proper error handling
  const refreshMutation = api.auth.refresh.useMutation({
    onSuccess: (newSession: Session) => {
      // Update the query cache with new session data
      utils.auth.getSession.setData(undefined, newSession)
      // Invalidate queries that depend on session
      utils.invalidate()
    },
    onError: (error) => {
      console.error('Session refresh failed:', error)
      // Optionally redirect to login or handle error
    }
  })

  // Memoized refresh function
  const refreshToken = useCallback(async () => {
    try {
      await refreshMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }, [refreshMutation])

  // Effect to handle session refresh
  useEffect(() => {
    if (!isLoading && !session) {
      refreshToken()
    }

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      if (session) {
        refreshToken()
      }
    }, 1000 * 60 * 14) // Refresh every 14 minutes

    return () => clearInterval(intervalId)
  }, [session, isLoading, refreshToken])

  return {
    session,
    isLoading,
    refresh: refreshToken, // Expose refresh function
    utils, // Expose utils for manual cache updates
  }
} 