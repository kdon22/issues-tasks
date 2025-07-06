// Workspace Issue Type States API Route - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-utils';

// Schema for managing states within a status flow
const stateSchema = z.object({
  id: z.string().optional(), // For existing states
  name: z.string().min(1, 'State name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  type: z.enum(['BACKLOG', 'UNSTARTED', 'STARTED', 'COMPLETED', 'CANCELED']),
  position: z.number().default(0),
});

const statesUpdateSchema = z.object({
  states: z.array(stateSchema).min(1, 'At least one state is required'),
});

const createStateSchema = z.object({
  name: z.string().min(1, 'State name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  type: z.enum(['BACKLOG', 'UNSTARTED', 'STARTED', 'COMPLETED', 'CANCELED']),
  position: z.number().default(0),
});

// GET - Get all states for a status flow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueTypeId } = await params;

    // Get the workspace first
    const workspace = await prisma.workspace.findFirst({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get the issue type with its status flow and states
    const issueType = await prisma.issueType.findUnique({
      where: { 
        id: issueTypeId,
        workspaceId: workspace.id,
      },
      include: {
        statusFlow: {
          include: {
            states: {
              orderBy: { position: 'asc' },
            },
          },
        },
        workspace: true,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Issue type not found' }, { status: 404 });
    }

    // Return states from the status flow, or empty array if no status flow
    const states = issueType.statusFlow?.states || [];
    
    return NextResponse.json({
      data: states,
    });
  } catch (error) {
    console.error('Error fetching status flow states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new state
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueTypeId } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = createStateSchema.parse(body);

    // Get the workspace first
    const workspace = await prisma.workspace.findFirst({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if the issue type exists and get its status flow
    const issueType = await prisma.issueType.findUnique({
      where: { 
        id: issueTypeId,
        workspaceId: workspace.id,
      },
      include: {
        statusFlow: true,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Issue type not found' }, { status: 404 });
    }

    if (!issueType.statusFlow) {
      return NextResponse.json({ error: 'Issue type has no status flow' }, { status: 400 });
    }

    // Create the new state in the status flow
    const newState = await prisma.state.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        type: validatedData.type,
        position: validatedData.position,
        statusFlowId: issueType.statusFlow.id,
      },
    });

    return NextResponse.json({ data: newState }, { status: 201 });
  } catch (error) {
    console.error('Error creating state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update states for a status flow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueTypeId } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = statesUpdateSchema.parse(body);
    const { states } = validatedData;

    // Get the workspace first
    const workspace = await prisma.workspace.findFirst({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if the issue type exists and get its status flow
    const issueType = await prisma.issueType.findUnique({
      where: { 
        id: issueTypeId,
        workspaceId: workspace.id,
      },
      include: {
        statusFlow: true,
        workspace: true,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Issue type not found' }, { status: 404 });
    }

    if (!issueType.statusFlow) {
      return NextResponse.json({ error: 'Issue type has no status flow' }, { status: 400 });
    }

    // Get existing states for this status flow
    const existingStates = await prisma.state.findMany({
      where: { statusFlowId: issueType.statusFlow.id },
    });

    // Separate new states from existing ones
    const newStates = states.filter((state) => !state.id);
    const updatedStates = states.filter((state) => state.id);

    // Create new states
    if (newStates.length > 0) {
      await Promise.all(
        newStates.map((state) =>
          prisma.state.create({
            data: {
              name: state.name,
              description: state.description,
              color: state.color,
              type: state.type,
              position: state.position,
              statusFlowId: issueType.statusFlow!.id,
            },
          })
        )
      );
    }

    // Update existing states
    if (updatedStates.length > 0) {
      await Promise.all(
        updatedStates.map((state) =>
          prisma.state.update({
            where: { id: state.id },
            data: {
              name: state.name,
              description: state.description,
              color: state.color,
              type: state.type,
              position: state.position,
            },
          })
        )
      );
    }

    // Remove states that are no longer in the list
    const stateIdsToKeep = updatedStates.map((state) => state.id);
    const statesToDelete = existingStates.filter(
      (state) => !stateIdsToKeep.includes(state.id)
    );

    if (statesToDelete.length > 0) {
      await Promise.all(
        statesToDelete.map((state) =>
          prisma.state.delete({
            where: { id: state.id },
          })
        )
      );
    }

    // Return the updated status flow with states
    const updatedIssueType = await prisma.issueType.findUnique({
      where: { id: issueTypeId },
      include: {
        statusFlow: {
          include: {
            states: {
              orderBy: { position: 'asc' },
            },
          },
        },
        workspace: true,
        _count: {
          select: { issues: true },
        },
      },
    });

    return NextResponse.json({
      data: updatedIssueType?.statusFlow?.states || [],
    });
  } catch (error) {
    console.error('Error updating status flow states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 