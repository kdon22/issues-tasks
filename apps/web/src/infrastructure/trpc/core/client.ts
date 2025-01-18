import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../routers/router'
import { httpBatchLink } from '@trpc/client'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { transformer } from './config'
import { useQueryClient } from '@tanstack/react-query'

export const trpc = createTRPCReact<AppRouter>()

// Create TRPC client
const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
  transformer,
})

export { client as api }

// Type helpers
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

interface OptimisticUpdateOptions<T> {
  queryKey: readonly string[]  // Make readonly to match TanStack Query
  updateFn: (oldData: T | undefined) => T
  mutationFn: () => Promise<unknown>
}

export function useTRPC() {
  const utils = trpc.useContext()
  const queryClient = useQueryClient()

  return {
    ...utils,
    optimisticUpdate: async <T>({ queryKey, updateFn, mutationFn }: OptimisticUpdateOptions<T>) => {
      const previousData = queryClient.getQueryData<T>(queryKey)
      
      try {
        queryClient.setQueryData(queryKey, updateFn(previousData))
        await mutationFn()
      } catch (error) {
        queryClient.setQueryData(queryKey, previousData)
        throw error
      }
    },
    enableBackgroundUpdates: (queryKey: readonly string[]) => {
      queryClient.setQueryDefaults(queryKey, {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
      })
    }
  }
} 