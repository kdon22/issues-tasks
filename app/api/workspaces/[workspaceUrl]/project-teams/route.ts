// Project Teams API - Multi-team support
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceUrl: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl } = await params;
    const body = await request.json();
    const { projectId, teamId, role = 'MEMBER' } = body;

    // Verify workspace access
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
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Verify project exists and belongs to workspace
    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        workspaceId: workspace.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify team exists and belongs to workspace
    const team = await prisma.team.findUnique({
      where: { 
        id: teamId,
        workspaceId: workspace.id,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Create project team relationship
    const projectTeam = await prisma.projectTeam.create({
      data: {
        projectId,
        teamId,
        role: role.toUpperCase(), // Ensure enum value
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            identifier: true,
          },
        },
      },
    });

    return NextResponse.json({ data: projectTeam }, { status: 201 });
  } catch (error: any) {
    console.error('Project team creation error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Team already added to project' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 