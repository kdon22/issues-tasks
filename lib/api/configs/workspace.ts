// Workspace API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { workspaceSchema } from '@/lib/validations/workspace';
import { CrudConfig } from '../types';

export const workspaceConfig: CrudConfig<any> = {
  model: prisma.workspace,
  schema: {
    create: workspaceSchema,
    update: workspaceSchema.partial(),
  },
  relations: ['members', 'teams', 'projects'],
  filters: {
    default: (ctx) => ({
      // Users can only see workspaces they're members of
      members: {
        some: { userId: ctx.userId }
      }
    }),
  },
  permissions: {
    create: (ctx) => true, // TODO: Check if user can create workspaces
    update: (ctx, item) => {
      // Only workspace owners/admins can update
      return true; // TODO: Check workspace role
    },
    delete: (ctx, item) => {
      // Only workspace owners can delete
      return true; // TODO: Check workspace role
    },
  },
};

export interface Workspace {
  id: string;
  name: string;
  url: string;
  description?: string;
  avatarType: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  avatarIcon?: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarImageUrl?: string;
  fiscalYearStart?: string;
  region?: string;
  allowGuestAccess: boolean;
  requireTwoFactor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceUpdateRequest {
  name?: string;
  url?: string;
  description?: string;
  avatarType?: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  avatarIcon?: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarImageUrl?: string;
  fiscalYearStart?: string;
  region?: string;
  allowGuestAccess?: boolean;
  requireTwoFactor?: boolean;
}

// API utility functions
export const updateWorkspace = async (workspaceId: string, data: WorkspaceUpdateRequest): Promise<Workspace> => {
  const response = await fetch(`/api/workspace/${workspaceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update workspace');
  }

  const result = await response.json();
  return result.data;
};

export const uploadWorkspaceAvatar = async (workspaceId: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`/api/workspace/${workspaceId}/avatar`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }

  const result = await response.json();
  return result.avatarUrl;
}; 