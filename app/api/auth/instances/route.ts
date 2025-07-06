// Instance Discovery API - Central Auth Service
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/auth/instances - Get user's accessible instances
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all instances where user has access
    const userInstances = await prisma.userInstanceSession.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        instance: {
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
            status: true
          }
        }
      },
      orderBy: {
        lastAccessed: 'desc'
      }
    });

    const instances = userInstances.map(ui => ({
      ...ui.instance,
      lastAccessed: ui.lastAccessed
    }));

    // Graceful handling: Return empty array if no instances
    // This prevents 500 errors and allows proper UI handling
    return NextResponse.json({ 
      instances,
      message: instances.length === 0 ? 'No instances available for this user' : undefined
    });
  } catch (error) {
    console.error('Error fetching user instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    );
  }
}

const createInstanceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  domain: z.string().min(1)
});

// POST /api/auth/instances - Create new instance (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user is admin
    
    const body = await request.json();
    const validatedData = createInstanceSchema.parse(body);

    const instance = await prisma.instance.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        domain: validatedData.domain,
        status: 'ACTIVE'
      }
    });

    // Create initial session for creator
    await prisma.userInstanceSession.create({
      data: {
        userId: session.user.id,
        instanceId: instance.id,
        isActive: true
      }
    });

    // Create admin permissions for creator
    await prisma.userInstancePermission.create({
      data: {
        userId: session.user.id,
        instanceId: instance.id,
        role: 'ADMIN',
        permissions: {
          admin: true,
          manageUsers: true,
          manageSettings: true
        }
      }
    });

    return NextResponse.json({ instance });
  } catch (error) {
    console.error('Error creating instance:', error);
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    );
  }
} 