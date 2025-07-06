// useResource Hook - DRY CRUD Operations with React Query
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ResourceConfig<T> {
  endpoint: string;
  transform?: (data: any) => T[];
  optimisticUpdates?: boolean;
  showToasts?: boolean;
  cacheKey?: string;
  mockData?: T[];
  fallbackData?: T[];
}

interface ResourceState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSync: Date | null;
}

interface ResourceActions<T> {
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  syncPending: () => Promise<void>;
}

interface ResourceHook<T> extends ResourceState<T>, ResourceActions<T> {}

export function useResource<T extends { id: string }>(
  config: ResourceConfig<T>
): ResourceHook<T> {
  const {
    endpoint,
    transform,
    optimisticUpdates = true,
    showToasts = true,
    cacheKey = endpoint,
    mockData = [],
    fallbackData = []
  } = config;

  const queryClient = useQueryClient();

  // Use React Query for data fetching
  const {
    data: rawData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [cacheKey],
    queryFn: async (): Promise<T[]> => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const apiResponse = await response.json();
      
      // Handle different API response formats
      let data: T[];
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        // API returns { data: [...] } format
        data = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        // API returns [...] format directly
        data = apiResponse;
      } else {
        // Fallback for other formats
        data = [];
      }
      
      return transform ? transform(data) : data;
    },
    initialData: mockData.length > 0 ? mockData : fallbackData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    retry: 2
  });

  // Transform data
  const items = rawData || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const apiResponse = await response.json();
      return apiResponse.data || apiResponse;
    },
    onMutate: async (newData) => {
      if (!optimisticUpdates) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [cacheKey] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<T[]>([cacheKey]);

      // Optimistically update to the new value
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const optimisticItem = { ...newData, id: tempId } as T;
      
      queryClient.setQueryData<T[]>([cacheKey], (old) => [
        ...(old || []),
        optimisticItem
      ]);

      // Return a context object with the snapshotted value
      return { previousItems, tempId };
    },
    onSuccess: (data, variables, context) => {
      // Replace the optimistic update with the real data
      queryClient.setQueryData<T[]>([cacheKey], (old) => 
        old?.map(item => 
          item.id === context?.tempId ? data : item
        ) || []
      );

      if (showToasts) {
        toast.success('Created successfully');
      }
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousItems) {
        queryClient.setQueryData([cacheKey], context.previousItems);
      }
      
      if (showToasts) {
        toast.error('Failed to create');
      }
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const apiResponse = await response.json();
      return apiResponse.data || apiResponse;
    },
    onMutate: async ({ id, data }) => {
      if (!optimisticUpdates) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [cacheKey] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<T[]>([cacheKey]);

      // Optimistically update to the new value
      queryClient.setQueryData<T[]>([cacheKey], (old) =>
        old?.map(item => 
          item.id === id ? { ...item, ...data } : item
        ) || []
      );

      // Return a context object with the snapshotted value
      return { previousItems };
    },
    onSuccess: (data, variables) => {
      // Update with the real server data
      queryClient.setQueryData<T[]>([cacheKey], (old) =>
        old?.map(item => 
          item.id === variables.id ? data : item
        ) || []
      );

      if (showToasts) {
        toast.success('Updated successfully');
      }
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousItems) {
        queryClient.setQueryData([cacheKey], context.previousItems);
      }
      
      if (showToasts) {
        toast.error('Failed to update');
      }
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return id;
    },
    onMutate: async (id) => {
      if (!optimisticUpdates) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [cacheKey] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<T[]>([cacheKey]);

      // Optimistically update to the new value
      queryClient.setQueryData<T[]>([cacheKey], (old) =>
        old?.filter(item => item.id !== id) || []
      );

      // Return a context object with the snapshotted value
      return { previousItems };
    },
    onSuccess: (deletedId) => {
      // Remove the item from the cache
      queryClient.setQueryData<T[]>([cacheKey], (old) =>
        old?.filter(item => item.id !== deletedId) || []
      );

      if (showToasts) {
        toast.success('Deleted successfully');
      }
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousItems) {
        queryClient.setQueryData([cacheKey], context.previousItems);
      }
      
      if (showToasts) {
        toast.error('Failed to delete');
      }
    }
  });

  // Action methods
  const create = useCallback(async (data: Partial<T>): Promise<T> => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const update = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteResource = useCallback(async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const refetchData = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  const syncPending = useCallback(async (): Promise<void> => {
    // For now, just refetch - in a real app you'd sync offline operations
    await refetch();
  }, [refetch]);

  return {
    items,
    loading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: error?.message || null,
    isOnline: navigator.onLine,
    lastSync: new Date(), // For now, just use current time
    create,
    update,
    delete: deleteResource,
    refetch: refetchData,
    syncPending
  };
}

// Specialized hooks for common patterns
export function useMembers() {
  return useResource({
    endpoint: '/api/members',
    cacheKey: 'members',
    mockData: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' }
    ]
  });
}

export function useTeamsCRUD() {
  return useResource({
    endpoint: '/api/teams',
    cacheKey: 'teams',
    mockData: [
      { 
        id: '1', 
        name: 'Engineering', 
        identifier: 'ENG',
        description: 'Product development team',
        avatarType: 'INITIALS' as const,
        avatarColor: '#6366F1',
        memberCount: 12,
        issueCount: 43,
        isPrivate: false,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2024-01-15'),
      },
      { 
        id: '2', 
        name: 'Design', 
        identifier: 'DES',
        description: 'UI/UX design team',
        avatarType: 'EMOJI' as const,
        avatarEmoji: '🎨',
        memberCount: 8,
        issueCount: 28,
        isPrivate: false,
        createdAt: new Date('2023-07-15'),
        updatedAt: new Date('2024-01-14'),
      }
    ]
  });
}

export function useLabelsCRUD() {
  return useResource({
    endpoint: '/api/labels',
    cacheKey: 'labels',
    mockData: [
      { id: '1', name: 'bug', color: '#ef4444' },
      { id: '2', name: 'feature', color: '#22c55e' }
    ]
  });
}

export function useStatesCRUD() {
  return useResource({
    endpoint: '/api/states',
    cacheKey: 'states',
    mockData: [
      { id: '1', name: 'Todo', color: '#6b7280' },
      { id: '2', name: 'In Progress', color: '#3b82f6' },
      { id: '3', name: 'Done', color: '#22c55e' }
    ]
  });
}

export function useIssueTypesCRUD() {
  return useResource({
    endpoint: '/api/issue-types',
    cacheKey: 'issue-types',
    mockData: [
      { id: '1', name: 'Bug', icon: '🐛', color: '#ef4444' },
      { id: '2', name: 'Feature', icon: '✨', color: '#8b5cf6' }
    ]
  });
}

export function useWorkspaceCRUD() {
  return useResource({
    endpoint: '/api/workspace',
    cacheKey: 'workspace',
    mockData: [
      { id: '1', name: 'My Workspace', description: 'Default workspace' }
    ]
  });
} 