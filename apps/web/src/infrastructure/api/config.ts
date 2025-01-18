import superjson from 'superjson'
import { httpBatchLink } from '@trpc/client'

export const TRPC_CONFIG = {
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
} as const

// Version this to track breaking changes
export const TRPC_VERSION = '1.0.0' 