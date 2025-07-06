// Teams API Config - Linear Clone (Super DRY!)
import { prisma } from '@/lib/prisma';
import { teamCreateSchema, teamUpdateSchema } from '@/lib/validations/team';
import { CrudConfig } from '../types';

export const teamsConfig: CrudConfig<any> = {
  model: prisma.team,
  schema: {
    create: teamCreateSchema,
    update: teamUpdateSchema,
  },
  relations: ['workspace', 'members', 'projects', 'issues'],
  filters: {
    default: async (ctx) => {
      // Check if user is a workspace admin/owner
      const workspaceMember = await prisma.workspaceMember.findFirst({
        where: {
          userId: ctx.userId,
          // For now, get the first workspace the user is a member of
          // TODO: Use ctx.workspaceId when properly implemented
        },
        select: {
          role: true,
          workspaceId: true,
        },
      });

      if (!workspaceMember) {
        // User is not a member of any workspace, show no teams
        console.log('🔒 User not found in any workspace, showing no teams');
        return {
          id: 'impossible-id-that-matches-nothing',
        };
      }

      const isAdmin = workspaceMember.role === 'ADMIN' || workspaceMember.role === 'OWNER';
      
      if (isAdmin) {
        // Workspace admins can see all teams in the workspace
        console.log('👑 Admin user detected - showing all teams in workspace');
        return {
          workspaceId: workspaceMember.workspaceId,
        };
      } else {
        // Regular users can only see:
        // 1. Teams they are members of
        // 2. Public teams in their workspace
        console.log('👤 Regular user detected - showing member teams + public teams');
        return {
          workspaceId: workspaceMember.workspaceId,
          OR: [
            {
              // Teams they are members of
              members: {
                some: {
                  userId: ctx.userId,
                },
              },
            },
            {
              // Public teams (assuming settings.isPrivate is false or null)
              OR: [
                {
                  settings: {
                    path: ['isPrivate'],
                    equals: false,
                  },
                },
                {
                  settings: {
                    path: ['isPrivate'],
                    equals: null,
                  },
                },
                {
                  settings: null,
                },
              ],
            },
          ],
        };
      }
    },
  },
  permissions: {
    create: (ctx) => true,
    update: (ctx, item) => {
      // Only team owners/admins can update
      return true; // TODO: Check team role
    },
    delete: (ctx, item) => {
      // Only team owners can delete
      return true; // TODO: Check team role
    },
  },
};

export interface Team {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  avatarType: 'INITIALS' | 'ICON' | 'EMOJI' | 'IMAGE';
  avatarIcon?: string;
  avatarColor?: string;
  avatarEmoji?: string;
  avatarImageUrl?: string;
  memberCount: number;
  issueCount: number;
  isPrivate: boolean;
  parentTeamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamCopyRequest {
  sourceTeamId: string;
  newTeamData: {
    name: string;
    identifier: string;
    description?: string;
  };
}

export interface TeamCopyResponse {
  success: boolean;
  team: Team;
  copiedFrom: string;
  message: string;
}

export interface TeamSettingsResponse {
  success: boolean;
  settings: {
    id: string;
    avatarType: string;
    avatarColor: string;
    avatarEmoji: string;
    avatarIcon: string;
    isPrivate: boolean;
    description?: string;
    workflowSettings: any;
    projectSettings: any;
  };
}

// Basic CRUD operations - using direct API calls

// Copy team settings functionality
export const copyTeamSettings = async (request: TeamCopyRequest): Promise<TeamCopyResponse> => {
  const response = await fetch('/api/teams/copy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to copy team settings');
  }

  return response.json();
};

// Get copyable settings from a team
export const getTeamSettings = async (teamId: string): Promise<TeamSettingsResponse> => {
  const response = await fetch(`/api/teams/copy?teamId=${teamId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch team settings');
  }

  return response.json();
};

// Create team with optional copying
export const createTeamWithCopy = async (
  name: string,
  identifier: string,
  description: string,
  sourceTeamId?: string
): Promise<Team> => {
  if (sourceTeamId) {
    // Copy from existing team
    const copyRequest: TeamCopyRequest = {
      sourceTeamId,
      newTeamData: {
        name,
        identifier,
        description,
      },
    };
    
    const response = await copyTeamSettings(copyRequest);
    return response.team;
  } else {
    // Create new team without copying
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        identifier,
        description,
        avatarType: 'INITIALS',
        avatarColor: '#6366F1',
        avatarEmoji: '🚀',
        avatarIcon: 'users',
        isPrivate: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create team');
    }

    const result = await response.json();
    return result.data;
  }
}; 