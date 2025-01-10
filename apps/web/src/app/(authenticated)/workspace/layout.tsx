'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api, vanillaClient } from '@/lib/trpc/client'
import { QueryClient } from '@tanstack/react-query'

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  }
})

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Use prefetched data
  const { data: workspaces, isLoading } = api.workspace.list.useQuery(undefined, {
    initialData: () => {
      const cached = queryClient.getQueryData(['workspaces'])
      console.log('Cached workspaces:', cached)
      return cached
    }
  })

  // Debug mount and updates
  useEffect(() => {
    console.log('WorkspaceLayout mounted/updated:', {
      pathname,
      workspaces,
      isLoading
    })
  }, [pathname, workspaces, isLoading])

  // Prefetch using vanilla client
  useEffect(() => {
    console.log('Prefetching workspaces...')
    vanillaClient.workspace.list.query()
      .then(data => console.log('Prefetch successful:', data))
      .catch(err => console.error('Prefetch failed:', err))
  }, [])

  // Only redirect if we're at the root workspace path
  useEffect(() => {
    console.log('Checking redirect:', {
      pathname,
      hasWorkspaces: workspaces?.length > 0,
      shouldRedirect: workspaces?.length > 0 && pathname === '/workspace'
    })

    if (workspaces?.length > 0 && pathname === '/workspace') {
      const targetUrl = `/${workspaces[0].url}/my-issues`
      console.log('Redirecting to:', targetUrl)
      router.push(targetUrl)
    }
  }, [workspaces, router, pathname])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
} 