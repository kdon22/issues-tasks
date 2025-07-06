// Members API Config - Linear Clone
import { prisma } from '@/lib/prisma';
import { memberCreateSchema, memberUpdateSchema } from '@/lib/validations/member';
import { CrudConfig } from '../types';

export const membersConfig: CrudConfig<any> = {
  model: prisma.workspaceMember,
  schema: {
    create: memberCreateSchema,
    update: memberUpdateSchema,
  },
  relations: ['user', 'workspace'],
  filters: {
    default: (ctx) => ({}), // Workspace filtering is handled by workspace-crud-factory
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => true,
    delete: (ctx, item) => true,
  },
};

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  workspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  teams: {
    id: string;
    name: string;
    role: 'LEAD' | 'MEMBER' | 'VIEWER';
    permissions: {
      canCreateIssues: boolean;
      canAssignIssues: boolean;
      canManageTeam: boolean;
      canArchiveIssues: boolean;
    };
  }[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastActivity?: Date;
  joinedAt: Date;
  invitedBy?: string;
  inviteExpiry?: Date;
}

export interface MemberInviteRequest {
  email: string;
  workspaceRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  teams?: {
    teamId: string;
    role: 'LEAD' | 'MEMBER' | 'VIEWER';
  }[];
  workspaceId: string;
}

export interface MemberInviteResponse {
  success: boolean;
  member: Member;
  message: string;
}

// API utility functions
export const inviteMember = async (request: MemberInviteRequest): Promise<MemberInviteResponse> => {
  const response = await fetch('/api/members/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to invite member');
  }

  return response.json();
};

export const updateMemberWorkspaceRole = async (memberId: string, role: string): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workspaceRole: role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update member workspace role');
  }
};

export const updateMemberTeamRole = async (memberId: string, teamId: string, role: string): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}/teams`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teamId, role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update member team role');
  }
};

export const removeMemberFromTeam = async (memberId: string, teamId: string): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}/teams/${teamId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove member from team');
  }
};

export const removeMember = async (memberId: string): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove member');
  }
};

export const resendMemberInvitation = async (memberId: string): Promise<void> => {
  const response = await fetch(`/api/members/${memberId}/resend-invite`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to resend invitation');
  }
}; 