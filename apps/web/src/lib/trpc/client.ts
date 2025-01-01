import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from './routers'
import superjson from 'superjson'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = {
  transformer: superjson,
  links: [
    // your links...
  ],
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
} 