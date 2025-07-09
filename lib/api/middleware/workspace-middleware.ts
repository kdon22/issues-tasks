import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthContext } from './auth-middleware';
import { Workspace } from '@prisma/client';

export interface WorkspaceContext extends AuthContext {
  workspace: Workspace;
  workspaceUrl: string;
}

export interface WorkspaceRouteParams {
  params: Promise<{
    workspaceUrl: string;
    id?: string;
  }>;
}

export interface WorkspaceItemRouteParams {
  params: Promise<{
    workspaceUrl: string;
    id: string;
  }>;
}

export async function withWorkspaceAccess(
  request: NextRequest,
  routeParams: WorkspaceRouteParams
): Promise<WorkspaceContext> {
  const authContext = await withAuth(request);
  const { workspaceUrl } = await routeParams.params;

  const workspace = await prisma.workspace.findUnique({
    where: { url: workspaceUrl },
    include: {
      members: {
        where: { userId: authContext.userId },
        take: 1,
      },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    throw new WorkspaceError('Workspace not found or access denied', 404);
  }

  return {
    ...authContext,
    workspace,
    workspaceUrl,
  };
}

export async function withWorkspaceItemAccess(
  request: NextRequest,
  routeParams: WorkspaceItemRouteParams
): Promise<WorkspaceContext & { itemId: string }> {
  const context = await withWorkspaceAccess(request, routeParams);
  const { id } = await routeParams.params;

  return {
    ...context,
    itemId: id,
  };
}

export class WorkspaceError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'WorkspaceError';
  }
} 