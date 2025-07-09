// Workspace by URL API - 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    workspaceUrl: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { url: workspaceUrl },
      include: {
        members: {
          where: { userId: session.user.id },
          select: {
            role: true,
          },
          take: 1,
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return workspace with user's role
    const workspaceWithRole = {
      ...workspace,
      role: workspace.members[0].role,
      members: undefined, // Remove members from response
    };

    return NextResponse.json({ workspace: workspaceWithRole });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
} 