'use client'

import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '../trpc/core/client'
import { CACHE_TIMES } from '../trpc/utils/cache'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

// Create a client with our cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...CACHE_TIMES.MEDIUM,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Add headers if needed
      headers() {
        return {
          // Add any custom headers here
        }
      },
    }),
  ],
  transformer: superjson,
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
} 