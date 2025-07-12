"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { PermissionContext, UserPermissions } from '@/lib/permissions';

// Hook to get user permissions for a specific context
export function usePermissions(context: PermissionContext) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['permissions', context],
    queryFn: async (): Promise<UserPermissions> => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams();
      if (context.instanceId) params.append('instanceId', context.instanceId);
      if (context.workspaceId) params.append('workspaceId', context.workspaceId);
      if (context.teamId) params.append('teamId', context.teamId);

      const response = await fetch(`/api/permissions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      return data.permissions;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to check if user has a specific permission
export function useHasPermission(
  context: PermissionContext,
  permission: keyof UserPermissions['permissions']
) {
  const { data: permissions, isLoading } = usePermissions(context);
  
  return {
    hasPermission: permissions?.permissions[permission] || false,
    isLoading,
    permissions
  };
}

// Hook to get user's accessible instances
export function useUserInstances() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-instances'],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/auth/instances');
      if (!response.ok) {
        throw new Error('Failed to fetch instances');
      }

      const data = await response.json();
      return data.instances || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to get user's accessible workspaces
export function useUserWorkspaces(instanceId?: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-workspaces', instanceId],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams();
      if (instanceId) params.append('instanceId', instanceId);

      const response = await fetch(`/api/permissions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }

      const data = await response.json();
      return data.workspaces || [];
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to get user's accessible teams
export function useUserTeams(workspaceId?: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-teams', workspaceId],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      if (!workspaceId) {
        return [];
      }

      const response = await fetch(`/api/teams?workspaceId=${workspaceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      return data.teams || [];
    },
    enabled: !!session?.user?.id && !!workspaceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Convenience hooks for common permission checks
export function useCanManageInstance(instanceId?: string) {
  return useHasPermission({ instanceId }, 'canManageInstance');
}

export function useCanManageWorkspace(workspaceId?: string) {
  return useHasPermission({ workspaceId }, 'canManageWorkspace');
}

export function useCanManageTeam(teamId?: string) {
  return useHasPermission({ teamId }, 'canManageTeam');
}

export function useCanCreateIssues(teamId?: string) {
  return useHasPermission({ teamId }, 'canCreateIssues');
}

export function useCanViewIssues(teamId?: string) {
  return useHasPermission({ teamId }, 'canViewIssues');
}

export function useCanEditIssues(teamId?: string) {
  return useHasPermission({ teamId }, 'canEditIssues');
}

export function useCanDeleteIssues(teamId?: string) {
  return useHasPermission({ teamId }, 'canDeleteIssues');
}

// Hook to grant instance access (for admins)
export function useGrantInstanceAccess() {
  const { data: session } = useSession();

  return async (userId: string, instanceId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/permissions/instance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        instanceId,
        role
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to grant instance access');
    }

    return response.json();
  };
}

// Hook to revoke instance access (for admins)
export function useRevokeInstanceAccess() {
  const { data: session } = useSession();

  return async (userId: string, instanceId: string) => {
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/permissions/instance', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        instanceId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke instance access');
    }

    return response.json();
  };
} 