// CRUD Factory - Linear Clone Lightning Fast ⚡️
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse, ApiContext, CrudConfig, querySchema } from './types';

export function createCrudHandlers<T>(config: CrudConfig<T>) {
  // GET /api/[resource] - List with pagination (Lightning Fast ⚡️)
  const GET = async (request: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const ctx: ApiContext = { userId: session.user.id };
      
      // Parse query parameters
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams);
      const { page, limit, search, sortBy, sortOrder } = querySchema.parse(queryParams);

      // Build filters (async support for admin-based filtering)
      let where: any = {};
      if (config.filters?.default) {
        const filterResult = config.filters.default(ctx);
        where = { ...where, ...(filterResult instanceof Promise ? await filterResult : filterResult) };
      }
      if (search && config.schema.query) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total count and data in parallel for speed ⚡️
      const [total, data] = await Promise.all([
        config.model.count({ where }),
        config.model.findMany({
          where,
          include: getIncludeObject(config),
          skip: (page - 1) * limit,
          take: limit,
          orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
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
      console.error('GET error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  // POST /api/[resource] - Create (Lightning Fast ⚡️)
  const POST = async (request: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const ctx: ApiContext = { userId: session.user.id };
      
      // Check permissions
      if (config.permissions?.create && !config.permissions.create(ctx)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await request.json();
      const validatedData = config.schema.create.parse(body);

      // Prepare create data with auto-assignments
      const createData = await prepareCreateData(validatedData, session.user.id, config);

      const data = await config.model.create({
        data: createData,
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error('POST error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  return { GET, POST };
}

// Individual item handlers (Lightning Fast ⚡️)
export function createItemHandlers<T>(config: CrudConfig<T>) {
  const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;

      const data = await config.model.findUnique({
        where: { id },
        include: getIncludeObject(config),
      });

      if (!data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error) {
      console.error('GET item error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const PUT = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const ctx: ApiContext = { userId: session.user.id };
      const body = await request.json();
      const validatedData = config.schema.update.parse(body);

      // Check if item exists and permissions
      const existingItem = await config.model.findUnique({
        where: { id }
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      if (config.permissions?.update && !config.permissions.update(ctx, existingItem)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const data = await config.model.update({
        where: { id },
        data: validatedData,
        include: getIncludeObject(config),
      });

      const response: ApiResponse<T> = { data };
      return NextResponse.json(response);
    } catch (error: any) {
      console.error('PUT error:', error);
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { id } = await params;
      const ctx: ApiContext = { userId: session.user.id };

      // Check if item exists and permissions
      const existingItem = await config.model.findUnique({
        where: { id }
      });

      if (!existingItem) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      if (config.permissions?.delete && !config.permissions.delete(ctx, existingItem)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await config.model.delete({
        where: { id }
      });

      return NextResponse.json({ data: { success: true } });
    } catch (error) {
      console.error('DELETE error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };

  return { GET, PUT, DELETE };
}

// Helper functions for Lightning Fast performance ⚡️

function getIncludeObject(config: CrudConfig<any>) {
  if (!config.relations) return undefined;
  
  if (config.model === prisma.issue) {
    return {
      creator: true,
      assignee: true,
      team: true,
      project: true,
      state: true,
      labels: {
        include: {
          label: true
        }
      },
      comments: true,
      attachments: true
    };
  }
  
  return Object.fromEntries(config.relations.map(r => [r, true]));
}

async function prepareCreateData(validatedData: any, userId: string, config: CrudConfig<any>) {
  let createData: any = { ...validatedData };

  // Add creator/user fields based on model
  if (config.model === prisma.issue) {
    createData.creatorId = userId;
  } else if (config.model === prisma.customField) {
    createData.createdById = userId;
  }

  // Auto-assign workspaceId for teams
  if (config.model === prisma.team) {
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true }
    });
    
    if (userWorkspace) {
      createData.workspaceId = userWorkspace.workspaceId;
    }
  }

  // Auto-add creator as member for workspaces
  if (config.model === prisma.workspace) {
    createData.members = {
      create: {
        userId: userId,
        role: 'OWNER' // Creator becomes the owner
      }
    };
  }

  // Special handling for issues - auto-generate identifier and number
  if (config.model === prisma.issue) {
    const team = await prisma.team.findUnique({
      where: { id: validatedData.teamId }
    });
    
    if (!team) {
      throw new Error('Team not found');
    }

    const lastIssue = await prisma.issue.findFirst({
      where: { teamId: validatedData.teamId },
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const nextNumber = (lastIssue?.number || 0) + 1;
    createData.identifier = `${team.identifier}-${nextNumber}`;
    createData.number = nextNumber;
  }

  return createData;
} 