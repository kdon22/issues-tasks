// Status Flow CRUD Factory - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CrudConfig } from './types';
import { ApiResponse } from './types';

interface StatusFlowRouteParams {
  params: Promise<{
    workspaceUrl: string;
    id: string;
    stateId?: string;
  }>;
}

// Status Flow nested collection handlers (GET, POST)
export function createStatusFlowCrudHandlers<T>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: StatusFlowRouteParams) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id } = await params;

      // Find the workspace
      const workspace = await prisma.workspace.findUnique({
        where: { url: workspaceUrl },
        include: {
          members: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Find the status flow
      const statusFlow = await prisma.statusFlow.findFirst({
        where: {
          id,
          workspaceId: workspace.id,
        },
      });

      if (!statusFlow) {
        return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
      }

      // Parse query parameters
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      // Get all items for this status flow
      const data = await config.model.findMany({
        where: {
          statusFlowId: statusFlow.id,
        },
        include: getIncludeObject(config),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { position: 'asc' },
      });

      const response: ApiResponse<T[]> = { data };
      return NextResponse.json(response);
    } catch (error) {
      console.error('Status Flow GET error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const POST = async (request: NextRequest, { params }: StatusFlowRouteParams) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id } = await params;

      // Find the workspace
      const workspace = await prisma.workspace.findUnique({
        where: { url: workspaceUrl },
        include: {
          members: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Find the status flow
      const statusFlow = await prisma.statusFlow.findFirst({
        where: {
          id,
          workspaceId: workspace.id,
        },
      });

      if (!statusFlow) {
        return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
      }

      const body = await request.json();
      const validatedData = config.schema.create.parse(body);

      // Create the item
      const data = await config.model.create({
        data: {
          ...validatedData,
          statusFlowId: statusFlow.id,
        },
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error('Status Flow POST error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  return { GET, POST };
}

// Status Flow nested item handlers (GET, PUT, DELETE)
export function createStatusFlowItemHandlers<T>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string; stateId: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id, stateId } = await params;

      // Find the workspace
      const workspace = await prisma.workspace.findUnique({
        where: { url: workspaceUrl },
        include: {
          members: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Find the status flow
      const statusFlow = await prisma.statusFlow.findFirst({
        where: {
          id,
          workspaceId: workspace.id,
        },
      });

      if (!statusFlow) {
        return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
      }

      // Get item with status flow verification
      const data = await config.model.findFirst({
        where: {
          id: stateId,
          statusFlowId: statusFlow.id,
        },
        include: getIncludeObject(config),
      });

      if (!data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error) {
      console.error('Status Flow GET item error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const PUT = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string; stateId: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id, stateId } = await params;

      // Find the workspace
      const workspace = await prisma.workspace.findUnique({
        where: { url: workspaceUrl },
        include: {
          members: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Find the status flow
      const statusFlow = await prisma.statusFlow.findFirst({
        where: {
          id,
          workspaceId: workspace.id,
        },
      });

      if (!statusFlow) {
        return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
      }

      // Verify item exists and belongs to status flow
      const existingItem = await config.model.findFirst({
        where: {
          id: stateId,
          statusFlowId: statusFlow.id,
        },
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const validatedData = config.schema.update.parse(body);

      // Update the item
      const data = await config.model.update({
        where: { id: stateId },
        data: validatedData,
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error: any) {
      console.error('Status Flow PUT error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const DELETE = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string; stateId: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id, stateId } = await params;

      // Find the workspace
      const workspace = await prisma.workspace.findUnique({
        where: { url: workspaceUrl },
        include: {
          members: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      });

      if (!workspace || workspace.members.length === 0) {
        return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
      }

      // Find the status flow
      const statusFlow = await prisma.statusFlow.findFirst({
        where: {
          id,
          workspaceId: workspace.id,
        },
      });

      if (!statusFlow) {
        return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
      }

      // Verify item exists and belongs to status flow
      const existingItem = await config.model.findFirst({
        where: {
          id: stateId,
          statusFlowId: statusFlow.id,
        },
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Check if state has issues (for states)
      if (config.model === prisma.state) {
        const issueCount = await prisma.issue.count({
          where: { stateId },
        });

        if (issueCount > 0) {
          return NextResponse.json({ 
            error: `Cannot delete state with ${issueCount} issues. Move issues to another state first.` 
          }, { status: 400 });
        }
      }

      // Delete the item
      await config.model.delete({
        where: { id: stateId },
      });

      return NextResponse.json({ data: { success: true } });
    } catch (error) {
      console.error('Status Flow DELETE error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  return { GET, PUT, DELETE };
}

// Helper function to get include object
function getIncludeObject(config: CrudConfig<any>) {
  if (!config.relations) return {};
  
  const include: any = {};
  
  for (const relation of config.relations) {
    switch (relation) {
      case 'statusFlow':
        include.statusFlow = {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        };
        break;
      case '_count':
        include._count = {
          select: {
            issues: true,
          },
        };
        break;
      default:
        include[relation] = true;
        break;
    }
  }
  
  return include;
} 