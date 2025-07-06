// Members Collection API - Custom Implementation for Workspace Members
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { memberCreateSchema } from '@/lib/validations/index';

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

    // Get all members of this workspace with user details
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data to match expected format
    const transformedMembers = members.map(member => ({
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        status: member.user.status,
        createdAt: member.user.createdAt,
      },
    }));

    return NextResponse.json({ data: transformedMembers });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = memberCreateSchema.parse(body);

    // Find or create user by email
    let user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name || validatedData.email,
          password: 'temp-password-' + Date.now(), // Temporary password
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
    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: validatedData.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Transform data to match expected format
    const transformedMember = {
      id: member.id,
      role: member.role,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        status: member.user.status,
        createdAt: member.user.createdAt,
      },
    };

    return NextResponse.json({ data: transformedMember }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workspace member:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create workspace member' }, { status: 500 });
  }
} 