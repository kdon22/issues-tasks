'use client'

import { SessionProvider } from 'next-auth/react'
import { api } from '@/lib/trpc/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { WorkspaceProvider } from './WorkspaceProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: false
      }
    }
  }))

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  )

  return (
    <SessionProvider>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </QueryClientProvider>
      </api.Provider>
    </SessionProvider>
  )
} 