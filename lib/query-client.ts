// Query Client - Linear Clone (Optimized for Performance)
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (longer for instant navigation)
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 30 minutes after component unmounts (longer for better UX)
      gcTime: 30 * 60 * 1000, 
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus for instant navigation (like Linear)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect to avoid spam
      refetchOnReconnect: false,
      // Enable background refetching for fresh data
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query Keys Factory - DRY approach for consistent cache keys
export const queryKeys = {
  // Issues
  issues: {
    all: ['issues'] as const,
    lists: () => [...queryKeys.issues.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.issues.lists(), filters] as const,
    details: () => [...queryKeys.issues.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.issues.details(), id] as const,
  },
  
  // Projects  
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.teams.lists(), filters] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
  },
  
  // States
  states: {
    all: ['states'] as const,
    lists: () => [...queryKeys.states.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.states.lists(), filters] as const,
  },
  
  // Labels
  labels: {
    all: ['labels'] as const,
    lists: () => [...queryKeys.labels.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.labels.lists(), filters] as const,
  },
  
  // Custom Fields
  customFields: {
    all: ['custom-fields'] as const,
    lists: () => [...queryKeys.customFields.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customFields.lists(), filters] as const,
    details: () => [...queryKeys.customFields.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customFields.details(), id] as const,
  },
  
  // Field Configurations
  fieldConfigurations: {
    all: ['field-configurations'] as const,
    lists: () => [...queryKeys.fieldConfigurations.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.fieldConfigurations.lists(), filters] as const,
    details: () => [...queryKeys.fieldConfigurations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.fieldConfigurations.details(), id] as const,
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  issues: () => queryClient.invalidateQueries({ queryKey: queryKeys.issues.all }),
  projects: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  teams: () => queryClient.invalidateQueries({ queryKey: queryKeys.teams.all }),
  states: () => queryClient.invalidateQueries({ queryKey: queryKeys.states.all }),
  labels: () => queryClient.invalidateQueries({ queryKey: queryKeys.labels.all }),
  customFields: () => queryClient.invalidateQueries({ queryKey: queryKeys.customFields.all }),
  fieldConfigurations: () => queryClient.invalidateQueries({ queryKey: queryKeys.fieldConfigurations.all }),
}; 