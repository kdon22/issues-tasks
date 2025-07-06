// Workspace API - Linear Clone
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { workspaceConfig } from '@/lib/api/configs/workspace';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const { GET } = createCrudHandlers(workspaceConfig);

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().min(1, 'URL is required').regex(/^[a-z0-9-]+$/, 'URL must contain only lowercase letters, numbers, and dashes'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createWorkspaceSchema.parse(body);

    // Check if workspace URL already exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { url: validatedData.url },
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace URL already exists' },
        { status: 400 }
      );
    }

    // Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        avatarType: 'INITIALS',
        avatarColor: '#FF6B35',
      },
    });

    // Add the creator as an admin member
    await prisma.workspaceMember.create({
      data: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: 'ADMIN',
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error creating workspace:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
} 