// Current Workspace Hook - 
"use client";

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
  url: string;
  icon?: string;
  avatarImageUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

async function updateWorkspaceAccess(workspaceUrl: string) {
  try {
    await fetch(`/api/workspaces/by-url/${workspaceUrl}/access`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to update workspace access:', error);
  }
}

export function useCurrentWorkspace() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  const { data, error, isLoading } = useQuery({
    queryKey: ['current-workspace', workspaceUrl],
    queryFn: async () => {
      if (!workspaceUrl) return null;
      
      const response = await fetch(`/api/workspaces/by-url/${workspaceUrl}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      const result = await response.json();
      return result.workspace as Workspace;
    },
    enabled: !!workspaceUrl,
  });

  // Track workspace access when data is loaded
  useEffect(() => {
    if (data && workspaceUrl) {
      updateWorkspaceAccess(workspaceUrl);
    }
  }, [data, workspaceUrl]);

  return {
    workspace: data,
    isLoading,
    error,
  };
} 