import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from './use-current-workspace';
import { createActionClient, ActionClient, ActionRequest, ActionResponse } from '@/lib/api/action-client';
import { useState as useReactState, useEffect, useMemo } from 'react';
import { 
  Team, 
  Project, 
  Label, 
  Member, 
  IssueType, 
  State, 
  StatusFlow,
  FieldSet,
  Issue, 
  Comment, 
  Reaction,
  BaseResource,
  ResourceFromPrefix,
  ResourceTypeMap 
} from '@/lib/types';


// Global action client cache
const actionClientCache = new Map<string, ActionClient>();

// Get or create action client for workspace
function getActionClient(workspaceUrl: string): ActionClient {
  if (!actionClientCache.has(workspaceUrl)) {
    actionClientCache.set(workspaceUrl, createActionClient(workspaceUrl));
  }
  return actionClientCache.get(workspaceUrl)!;
}

// Base hook for action client
export function useActionClient(): ActionClient | null {
  const { workspace } = useCurrentWorkspace();
  
  return useMemo(() => {
    if (!workspace?.url) return null;
    return getActionClient(workspace.url);
  }, [workspace?.url]);
}

// Generic resource hooks factory
export function createResourceHooks<T = any>(actionPrefix: string) {
  return {
    useList: () => useActionQuery<T[]>(`${actionPrefix}.list`),
    
    useGet: (id?: string) => useActionQuery<T>(`${actionPrefix}.get`, { enabled: !!id }),
    
    useCreate: () => {
      const mutation = useActionMutation();
      return {
        ...mutation,
        create: (data: any) => mutation.mutate({
          action: `${actionPrefix}.create`,
          data
        })
      };
    },
    
    useUpdate: () => {
      const mutation = useActionMutation();
      return {
        ...mutation,
        update: (id: string, data: any) => mutation.mutate({
          action: `${actionPrefix}.update`,
          resourceId: id,
          data
        })
      };
    },
    
    useDelete: () => {
      const mutation = useActionMutation();
      return {
        ...mutation,
        delete: (id: string) => mutation.mutate({
          action: `${actionPrefix}.delete`,
          resourceId: id
        })
      };
    }
  };
}

// Resource type definitions are now imported from @/lib/types/resources

// Create typed resource hooks
export const teamHooks = createResourceHooks<Team>('team');
export const projectHooks = createResourceHooks<Project>('project');
export const labelHooks = createResourceHooks<Label>('label');
export const memberHooks = createResourceHooks<Member>('member');
export const issueTypeHooks = createResourceHooks<IssueType>('issueType');
export const stateHooks = createResourceHooks<State>('state');
export const statusFlowHooks = createResourceHooks<StatusFlow>('statusFlow');
export const fieldSetHooks = createResourceHooks<FieldSet>('fieldSet');
export const issueHooks = createResourceHooks<Issue>('issue');
export const commentHooks = createResourceHooks<Comment>('comment');
export const reactionHooks = createResourceHooks<Reaction>('reaction');

// Utility function to easily create new resource hooks for future resources
export function createNewResourceHooks<T = any>(actionPrefix: string) {
  return createResourceHooks<T>(actionPrefix);
}

// Export resource hooks collections for easy access
export const resourceHooks = {
  team: teamHooks,
  project: projectHooks,
  label: labelHooks,
  member: memberHooks,
  issueType: issueTypeHooks,
  state: stateHooks,
  statusFlow: statusFlowHooks,
  fieldSet: fieldSetHooks,
  issue: issueHooks,
  comment: commentHooks,
  reaction: reactionHooks
};

// Generic mutation hook for actions
export function useActionMutation<T = any>(
  options?: {
    onSuccess?: (data: T, variables: ActionRequest) => void;
    onError?: (error: Error, variables: ActionRequest) => void;
    optimisticUpdate?: boolean;
  }
) {
  const client = useActionClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: ActionRequest): Promise<T> => {
      if (!client) throw new Error('No action client available');
      
      const response = await client.executeAction<T>(request);
      if (!response.success) {
        throw new Error(response.error || 'Action failed');
      }
      return response.data!;
    },
    onMutate: async (variables) => {
      if (!options?.optimisticUpdate) return;
      
      const resourceType = variables.action.split('.')[0];
      const operation = variables.action.split('.')[1];
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 typeof queryKey[0] === 'string' && 
                 queryKey[0].startsWith(resourceType);
        }
      });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData([`${resourceType}.list`]);
      
      // Optimistically update to the new value
      if (operation === 'create' && variables.data) {
        queryClient.setQueryData([`${resourceType}.list`], (old: any) => {
          if (!Array.isArray(old)) return old;
          const optimisticItem = { id: `temp-${Date.now()}`, ...variables.data };
          return [...old, optimisticItem];
        });
      } else if (operation === 'update' && variables.resourceId && variables.data) {
        queryClient.setQueryData([`${resourceType}.list`], (old: any) => {
          if (!Array.isArray(old)) return old;
          return old.map((item: any) => 
            item.id === variables.resourceId ? { ...item, ...variables.data } : item
          );
        });
      } else if (operation === 'delete' && variables.resourceId) {
        queryClient.setQueryData([`${resourceType}.list`], (old: any) => {
          if (!Array.isArray(old)) return old;
          return old.filter((item: any) => item.id !== variables.resourceId);
        });
      }
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to ensure fresh data
      const resourceType = variables.action.split('.')[0];
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 typeof queryKey[0] === 'string' && 
                 queryKey[0].startsWith(resourceType);
        }
      });
      
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        const resourceType = variables.action.split('.')[0];
        queryClient.setQueryData([`${resourceType}.list`], context.previousData);
      }
      
      options?.onError?.(error, variables);
    }
  });
}

// Query hook with offline support
export function useActionQuery<T = any>(
  action: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: boolean | number;
  }
) {
  const client = useActionClient();
  
  return useQuery({
    queryKey: [action],
    queryFn: async (): Promise<T> => {
      if (!client) throw new Error('No action client available');
      
      const response = await client.executeAction<T>({ action });
      if (!response.success) {
        throw new Error(response.error || 'Query failed');
      }
      return response.data!;
    },
    enabled: !!client && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
    retry: options?.retry ?? 2
  });
}

// All resource hooks are now generic - use the hook instances directly
// Examples:
// const teams = teamHooks.useList();
// const team = teamHooks.useGet(id);
// const createTeam = teamHooks.useCreate();
// const updateTeam = teamHooks.useUpdate();
// const deleteTeam = teamHooks.useDelete();

// Bulk operations removed - use useActionMutation() directly:
// const mutation = useActionMutation();
// mutation.mutate({ action: 'bulk.delete', data: { resourceType: 'team', ids: ['1', '2'] } });

// Offline status hook
export function useOfflineStatus() {
  const client = useActionClient();
  const [isOffline, setIsOffline] = useReactState(false);
  const [pendingCount, setPendingCount] = useReactState(0);
  
  useEffect(() => {
    if (!client) return;
    
    const checkStatus = () => {
      setIsOffline(client.isOffline());
      setPendingCount(client.getPendingActionsCount());
    };
    
    // Check immediately
    checkStatus();
    
    // Check periodically
    const interval = setInterval(checkStatus, 1000);
    
    return () => clearInterval(interval);
  }, [client]);
  
  return {
    isOffline,
    pendingCount,
    clearCache: () => client?.clearCache()
  };
}

// Optimistic updates removed - use useActionMutation({ optimisticUpdate: true })
// or access useQueryClient() directly from @tanstack/react-query

// All other hooks removed - use the generic hooks directly:
//
// Cache invalidation: useQueryClient() from @tanstack/react-query
// Auto-sync: useQueryClient().refetchQueries() in useEffect
// Bootstrap: useActionMutation() with custom logic
// Bootstrap status: useActionQuery() with custom action

// File end - all hooks are now generic 