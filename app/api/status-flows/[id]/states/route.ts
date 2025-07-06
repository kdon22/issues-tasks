// Status Flow States API Route - Linear Clone
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

// GET - Get all states for a status flow
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const issueTypeId = params.id;

    // Get the issue type with its states
    const issueType = await prisma.issueType.findUnique({
      where: { id: issueTypeId },
      include: {
        states: {
          orderBy: { position: 'asc' },
        },
        workspace: true,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
    }

    return NextResponse.json({
      issueType,
      states: issueType.states,
    });
  } catch (error) {
    console.error('Error fetching status flow states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update states for a status flow
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const issueTypeId = params.id;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = statesUpdateSchema.parse(body);
    const { states } = validatedData;

    // Check if the issue type exists
    const issueType = await prisma.issueType.findUnique({
      where: { id: issueTypeId },
      include: {
        workspace: true,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
    }

    // Get existing states for this issue type
    const existingStates = await prisma.state.findMany({
      where: { issueTypeId },
    });

    // Separate new states from existing ones
    const newStates = states.filter((state) => !state.id);
    const updatedStates = states.filter((state) => state.id);

    // Get the first team in the workspace (for now, we'll use the first team)
    const firstTeam = await prisma.team.findFirst({
      where: { workspaceId: issueType.workspaceId },
    });

    if (!firstTeam) {
      return NextResponse.json({ error: 'No team found in workspace' }, { status: 400 });
    }

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
              issueTypeId,
              teamId: firstTeam.id,
              workspaceId: issueType.workspaceId,
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

    // Return the updated issue type with states
    const updatedIssueType = await prisma.issueType.findUnique({
      where: { id: issueTypeId },
      include: {
        states: {
          orderBy: { position: 'asc' },
        },
        workspace: true,
        _count: {
          select: { issues: true },
        },
      },
    });

    return NextResponse.json({
      issueType: updatedIssueType,
      states: updatedIssueType?.states || [],
    });
  } catch (error) {
    console.error('Error updating status flow states:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 