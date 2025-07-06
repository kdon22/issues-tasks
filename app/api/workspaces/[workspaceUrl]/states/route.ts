// Workspace States Aggregation API - Linear Clone
// This endpoint aggregates states from all status flows in a workspace
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl } = await params;

    // Find the workspace and verify access
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

    // Get all states from all status flows in this workspace
    const states = await prisma.state.findMany({
      where: {
        statusFlow: {
          workspaceId: workspace.id,
        },
      },
      include: {
        statusFlow: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            issues: true,
          },
        },
      },
      orderBy: [
        { statusFlow: { name: 'asc' } },
        { position: 'asc' },
      ],
    });

    return NextResponse.json({ data: states });
  } catch (error) {
    console.error('Error fetching workspace states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 