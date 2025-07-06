// Workspace-Scoped CRUD Factory - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CrudConfig, ApiResponse, ApiContext } from './types';

interface WorkspaceRouteParams {
  params: Promise<{
    workspaceUrl: string;
    id?: string;
  }>;
}

// Workspace-scoped collection handlers (GET, POST)
export function createWorkspaceCrudHandlers<T>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: WorkspaceRouteParams) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl } = await params;

      // Get workspace and verify access
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

      // Parse query parameters
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';

      // Build workspace-scoped filters
      let where: any = {
        workspaceId: workspace.id, // Always filter by workspace
      };

      // Add search filters if applicable
      if (search && config.schema.query) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total count and data in parallel
      const [total, data] = await Promise.all([
        config.model.count({ where }),
        config.model.findMany({
          where,
          include: getIncludeObject(config),
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
      ]);

      const response: ApiResponse<T[]> = {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Workspace GET error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const POST = async (request: NextRequest, { params }: WorkspaceRouteParams) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl } = await params;

      // Get workspace and verify access
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

      const body = await request.json();
      const validatedData = config.schema.create.parse(body);

      // Add workspace context to create data
      let createData = {
        ...validatedData,
        workspaceId: workspace.id,
      };

      // Special handling for Issue creation - auto-generate identifier and number
      if (config.model === prisma.issue) {
        // Add creator ID
        createData.creatorId = session.user.id;
        
        // Get team for identifier generation
        const team = await prisma.team.findUnique({
          where: { id: validatedData.teamId }
        });
        
        if (!team) {
          return NextResponse.json({ error: 'Team not found' }, { status: 400 });
        }

        // Get the next number for this team
        const lastIssue = await prisma.issue.findFirst({
          where: { teamId: validatedData.teamId },
          orderBy: { number: 'desc' },
          select: { number: true }
        });

        const nextNumber = (lastIssue?.number || 0) + 1;
        createData.identifier = `${team.identifier}-${nextNumber}`;
        createData.number = nextNumber;
      }

      // Special handling for WorkspaceMember creation
      if (config.model === prisma.workspaceMember) {
        // Find or create user by email
        let user = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: validatedData.email,
              name: validatedData.name || validatedData.email,
              password: 'temp-password-' + Date.now(), // Temporary password, should be reset on first login
              status: 'PENDING',
            },
          });
        }

        // Check if user is already a member of this workspace
        const existingMember = await prisma.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: user.id,
              workspaceId: workspace.id,
            },
          },
        });

        if (existingMember) {
          return NextResponse.json(
            { error: 'User is already a member of this workspace' },
            { status: 400 }
          );
        }

        // Create WorkspaceMember with the user
        const data = await config.model.create({
          data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: validatedData.role || 'MEMBER',
          },
          include: getIncludeObject(config),
        });

        const response: ApiResponse<T> = { data };
        return NextResponse.json(response, { status: 201 });
      }

      // Default creation for other models
      const data = await config.model.create({
        data: createData,
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error('Workspace POST error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  return { GET, POST };
}

// Workspace-scoped item handlers (GET, PUT, DELETE)
export function createWorkspaceItemHandlers<T>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id } = await params;

      // Get workspace and verify access
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

      // Get item with workspace verification
      const data = await config.model.findUnique({
        where: { 
          id,
          workspaceId: workspace.id, // Ensure item belongs to this workspace
        },
        include: getIncludeObject(config),
      });

      if (!data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error) {
      console.error('Workspace GET item error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const PUT = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id } = await params;

      // Get workspace and verify access
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

      // Verify item exists and belongs to workspace
      const existingItem = await config.model.findUnique({
        where: { 
          id,
          workspaceId: workspace.id,
        },
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const body = await request.json();
      const validatedData = config.schema.update.parse(body);

      // Special handling for WorkspaceMember updates
      if (config.model === prisma.workspaceMember) {
        // Check if we're updating user fields (status, name, etc.)
        const userFields = ['status', 'name'];
        const userUpdates: any = {};
        const memberUpdates: any = {};

        // Separate user fields from member fields
        Object.keys(validatedData).forEach(key => {
          if (userFields.includes(key)) {
            userUpdates[key] = validatedData[key];
          } else {
            memberUpdates[key] = validatedData[key];
          }
        });

        // Update user fields if any
        if (Object.keys(userUpdates).length > 0) {
          await prisma.user.update({
            where: { id: (existingItem as any).userId },
            data: userUpdates,
          });
        }

        // Update member fields if any
        let data = existingItem;
        if (Object.keys(memberUpdates).length > 0) {
          data = await config.model.update({
            where: { id },
            data: memberUpdates,
            include: getIncludeObject(config),
          });
        } else {
          // Refetch with includes to get updated user data
          data = await config.model.findUnique({
            where: { id },
            include: getIncludeObject(config),
          });
        }

        const response: ApiResponse<T> = { data };
        return NextResponse.json(response);
      }

      // Default update for other models
      const data = await config.model.update({
        where: { id },
        data: validatedData,
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error: any) {
      console.error('Workspace PUT error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const DELETE = async (request: NextRequest, { params }: { params: Promise<{ workspaceUrl: string; id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { workspaceUrl, id } = await params;

      // Get workspace and verify access
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

      // Verify item exists and belongs to workspace
      const existingItem = await config.model.findUnique({
        where: { 
          id,
          workspaceId: workspace.id,
        },
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Delete item
      await config.model.delete({
        where: { id },
      });

      return NextResponse.json({ data: { success: true } });
    } catch (error) {
      console.error('Workspace DELETE error:', error);
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
      case 'workspace':
        include.workspace = {
          select: {
            id: true,
            name: true,
            url: true,
          },
        };
        break;
      case 'user':
        include.user = {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        };
        break;
      case 'members':
        include.members = {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        };
        break;
      case '_count':
        // Handle different count relations based on model
        if (config.model === prisma.team) {
          include._count = {
            select: {
              issues: true,
              projects: true,
              members: true,
            },
          };
        } else if (config.model === prisma.workspaceMember) {
          // WorkspaceMember doesn't have countable relations, skip _count
          // include._count = {};
        } else if (config.model === prisma.issue) {
          include._count = {
            select: {
              comments: true,
              attachments: true,
            },
          };
        } else {
          // Default for labels, states, issue types
          include._count = {
            select: {
              issues: true,
            },
          };
        }
        break;
      case 'labels':
        // Special handling for issue labels - include the actual label data
        include.labels = {
          include: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              },
            },
          },
        };
        break;
      default:
        include[relation] = true;
    }
  }
  
  return include;
} 