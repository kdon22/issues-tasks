// Individual State API Route - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-utils';

const updateStateSchema = z.object({
  name: z.string().min(1, 'State name is required').optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  type: z.enum(['BACKLOG', 'UNSTARTED', 'STARTED', 'COMPLETED', 'CANCELED']).optional(),
  position: z.number().optional(),
});

// PUT - Update a specific state
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string; stateId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueTypeId, stateId } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateStateSchema.parse(body);

    // Get the workspace first
    const workspace = await prisma.workspace.findFirst({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if the issue type exists
    const issueType = await prisma.issueType.findUnique({
      where: { 
        id: issueTypeId,
        workspaceId: workspace.id,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
    }

    // Check if the state exists and belongs to this issue type
    const existingState = await prisma.state.findUnique({
      where: { 
        id: stateId,
        issueTypeId: issueTypeId,
        workspaceId: workspace.id,
      },
    });

    if (!existingState) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 });
    }

    // Update the state
    const updatedState = await prisma.state.update({
      where: { id: stateId },
      data: validatedData,
    });

    return NextResponse.json({ data: updatedState });
  } catch (error) {
    console.error('Error updating state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a specific state
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string; id: string; stateId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl, id: issueTypeId, stateId } = await params;

    // Get the workspace first
    const workspace = await prisma.workspace.findFirst({
      where: { url: workspaceUrl },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if the issue type exists
    const issueType = await prisma.issueType.findUnique({
      where: { 
        id: issueTypeId,
        workspaceId: workspace.id,
      },
    });

    if (!issueType) {
      return NextResponse.json({ error: 'Status flow not found' }, { status: 404 });
    }

    // Check if the state exists and belongs to this issue type
    const existingState = await prisma.state.findUnique({
      where: { 
        id: stateId,
        issueTypeId: issueTypeId,
        workspaceId: workspace.id,
      },
    });

    if (!existingState) {
      return NextResponse.json({ error: 'State not found' }, { status: 404 });
    }

    // Check if this is the last state (prevent deletion if so)
    const stateCount = await prisma.state.count({
      where: { issueTypeId: issueTypeId },
    });

    if (stateCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last state. Issue types must have at least one state.' },
        { status: 400 }
      );
    }

    // Delete the state
    await prisma.state.delete({
      where: { id: stateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 