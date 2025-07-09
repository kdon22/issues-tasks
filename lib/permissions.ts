// Multi-Level Permission System - 
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Permission Types
export type InstanceRole = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export interface PermissionContext {
  instanceId?: string;
  workspaceId?: string;
  teamId?: string;
  userId?: string;
}

export interface UserPermissions {
  instanceRole?: InstanceRole;
  workspaceRole?: WorkspaceRole;
  teamRole?: TeamRole;
  permissions: {
    // Instance level
    canAccessInstance: boolean;
    canManageInstance: boolean;
    
    // Workspace level
    canAccessWorkspace: boolean;
    canManageWorkspace: boolean;
    canInviteToWorkspace: boolean;
    canCreateTeams: boolean;
    canManageProjects: boolean;
    
    // Team level
    canAccessTeam: boolean;
    canManageTeam: boolean;
    canCreateIssues: boolean;
    canAssignIssues: boolean;
    canManageSettings: boolean;
    
    // Issue level
    canViewIssues: boolean;
    canEditIssues: boolean;
    canDeleteIssues: boolean;
    canCommentIssues: boolean;
  };
}

// Get current user's permissions for a specific context
export async function getUserPermissions(context: PermissionContext): Promise<UserPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return createEmptyPermissions();
  }

  const userId = session.user.id;
  const permissions: UserPermissions = {
    permissions: {
      // Default to false, will be set based on roles
      canAccessInstance: false,
      canManageInstance: false,
      canAccessWorkspace: false,
      canManageWorkspace: false,
      canInviteToWorkspace: false,
      canCreateTeams: false,
      canManageProjects: false,
      canAccessTeam: false,
      canManageTeam: false,
      canCreateIssues: false,
      canAssignIssues: false,
      canManageSettings: false,
      canViewIssues: false,
      canEditIssues: false,
      canDeleteIssues: false,
      canCommentIssues: false,
    }
  };

  // Get instance permissions
  if (context.instanceId) {
    const instancePermission = await prisma.userInstancePermission.findUnique({
      where: {
        userId_instanceId: {
          userId,
          instanceId: context.instanceId
        }
      }
    });

    if (instancePermission) {
      permissions.instanceRole = instancePermission.role as InstanceRole;
      permissions.permissions.canAccessInstance = true;
      permissions.permissions.canManageInstance = instancePermission.role === 'ADMIN';
    }
  }

  // Get workspace permissions
  if (context.workspaceId) {
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: context.workspaceId
        }
      }
    });

    if (workspaceMember) {
      permissions.workspaceRole = workspaceMember.role as WorkspaceRole;
      permissions.permissions.canAccessWorkspace = true;
      permissions.permissions.canManageWorkspace = ['OWNER', 'ADMIN'].includes(workspaceMember.role);
      permissions.permissions.canInviteToWorkspace = ['OWNER', 'ADMIN'].includes(workspaceMember.role);
      permissions.permissions.canCreateTeams = ['OWNER', 'ADMIN'].includes(workspaceMember.role);
      permissions.permissions.canManageProjects = ['OWNER', 'ADMIN', 'MEMBER'].includes(workspaceMember.role);
    }
  }

  // Get team permissions
  if (context.teamId) {
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: context.teamId
        }
      }
    });

    if (teamMember) {
      permissions.teamRole = teamMember.role;
      permissions.permissions.canAccessTeam = true;
      permissions.permissions.canManageTeam = ['OWNER', 'ADMIN'].includes(teamMember.role);
      permissions.permissions.canCreateIssues = ['OWNER', 'ADMIN', 'MEMBER'].includes(teamMember.role);
      permissions.permissions.canAssignIssues = ['OWNER', 'ADMIN', 'MEMBER'].includes(teamMember.role);
      permissions.permissions.canManageSettings = ['OWNER', 'ADMIN'].includes(teamMember.role);
      permissions.permissions.canViewIssues = true; // All team members can view
      permissions.permissions.canEditIssues = ['OWNER', 'ADMIN', 'MEMBER'].includes(teamMember.role);
      permissions.permissions.canDeleteIssues = ['OWNER', 'ADMIN'].includes(teamMember.role);
      permissions.permissions.canCommentIssues = ['OWNER', 'ADMIN', 'MEMBER'].includes(teamMember.role);
    }
  }

  return permissions;
}

// Check if user has specific permission
export async function checkPermission(
  context: PermissionContext,
  permission: keyof UserPermissions['permissions']
): Promise<boolean> {
  const userPermissions = await getUserPermissions(context);
  return userPermissions.permissions[permission];
}

// Check if user can access instance
export async function canAccessInstance(instanceId: string): Promise<boolean> {
  return checkPermission({ instanceId }, 'canAccessInstance');
}

// Check if user can access workspace
export async function canAccessWorkspace(workspaceId: string): Promise<boolean> {
  return checkPermission({ workspaceId }, 'canAccessWorkspace');
}

// Check if user can access team
export async function canAccessTeam(teamId: string): Promise<boolean> {
  return checkPermission({ teamId }, 'canAccessTeam');
}

// Get user's accessible instances
export async function getUserInstances() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userInstances = await prisma.userInstanceSession.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    include: {
      instance: {
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          status: true
        }
      }
    },
    orderBy: {
      lastAccessed: 'desc'
    }
  });

  return userInstances.map((ui: any) => ({
    ...ui.instance,
    lastAccessed: ui.lastAccessed
  }));
}

// Get user's accessible workspaces within an instance
export async function getUserWorkspaces(instanceId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const workspaces = await prisma.workspaceMember.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          url: true,
          avatarType: true,
          avatarColor: true,
          avatarEmoji: true,
          avatarIcon: true,
          avatarImageUrl: true
        }
      }
    },
    orderBy: {
      lastAccessedAt: 'desc'
    }
  });

  return workspaces.map((wm: any) => ({
    ...wm.workspace,
    role: wm.role,
    lastAccessed: wm.lastAccessedAt
  }));
}

// Get user's accessible teams within a workspace
export async function getUserTeams(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const teams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      team: {
        workspaceId
      }
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
          description: true,
          icon: true,
          avatarImageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return teams.map((tm: any) => ({
    ...tm.team,
    role: tm.role
  }));
}

// Permission middleware for API routes
export async function requirePermission(
  context: PermissionContext,
  permission: keyof UserPermissions['permissions']
) {
  const hasPermission = await checkPermission(context, permission);
  if (!hasPermission) {
    throw new Error(`Insufficient permissions: ${permission}`);
  }
}

// Higher-order function to protect API routes
export function withPermission(
  permission: keyof UserPermissions['permissions'],
  handler: (request: Request, context: PermissionContext) => Promise<Response>
) {
  return async (request: Request, params: any) => {
    try {
      // Extract context from request/params
      const context: PermissionContext = {
        instanceId: params.instanceId,
        workspaceId: params.workspaceId,
        teamId: params.teamId
      };

      await requirePermission(context, permission);
      return handler(request, context);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403 }
      );
    }
  };
}

// Utility to create empty permissions
function createEmptyPermissions(): UserPermissions {
  return {
    permissions: {
      canAccessInstance: false,
      canManageInstance: false,
      canAccessWorkspace: false,
      canManageWorkspace: false,
      canInviteToWorkspace: false,
      canCreateTeams: false,
      canManageProjects: false,
      canAccessTeam: false,
      canManageTeam: false,
      canCreateIssues: false,
      canAssignIssues: false,
      canManageSettings: false,
      canViewIssues: false,
      canEditIssues: false,
      canDeleteIssues: false,
      canCommentIssues: false,
    }
  };
} 