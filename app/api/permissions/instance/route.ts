// Instance Permission API - Central Auth Service
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserPermissions, requirePermission } from '@/lib/permissions';
import { z } from 'zod';

const grantInstanceAccessSchema = z.object({
  userId: z.string(),
  instanceId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER')
});

// POST /api/permissions/instance - Grant instance access to user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, instanceId, role } = grantInstanceAccessSchema.parse(body);

    // Check if requester has permission to manage this instance
    await requirePermission({ instanceId }, 'canManageInstance');

    // Grant or update instance access
    const instancePermission = await prisma.userInstancePermission.upsert({
      where: {
        userId_instanceId: {
          userId,
          instanceId
        }
      },
      create: {
        userId,
        instanceId,
        role,
        permissions: {
          admin: role === 'ADMIN',
          member: ['ADMIN', 'MEMBER'].includes(role),
          viewer: true
        }
      },
      update: {
        role,
        permissions: {
          admin: role === 'ADMIN',
          member: ['ADMIN', 'MEMBER'].includes(role),
          viewer: true
        }
      }
    });

    // Create or update instance session
    await prisma.userInstanceSession.upsert({
      where: {
        userId_instanceId: {
          userId,
          instanceId
        }
      },
      create: {
        userId,
        instanceId,
        isActive: true
      },
      update: {
        isActive: true,
        lastAccessed: new Date()
      }
    });

    return NextResponse.json({ instancePermission });
  } catch (error) {
    console.error('Error granting instance access:', error);
    return NextResponse.json(
      { error: 'Failed to grant instance access' },
      { status: 500 }
    );
  }
}

// GET /api/permissions/instance?instanceId=xxx - Get instance permissions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get('instanceId');

    if (!instanceId) {
      return NextResponse.json({ error: 'Instance ID required' }, { status: 400 });
    }

    // Get user's permissions for this instance
    const permissions = await getUserPermissions({ instanceId });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Error fetching instance permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instance permissions' },
      { status: 500 }
    );
  }
}

const revokeInstanceAccessSchema = z.object({
  userId: z.string(),
  instanceId: z.string()
});

// DELETE /api/permissions/instance - Revoke instance access
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, instanceId } = revokeInstanceAccessSchema.parse(body);

    // Check if requester has permission to manage this instance
    await requirePermission({ instanceId }, 'canManageInstance');

    // Revoke instance access
    await prisma.userInstancePermission.delete({
      where: {
        userId_instanceId: {
          userId,
          instanceId
        }
      }
    });

    // Deactivate instance session
    await prisma.userInstanceSession.update({
      where: {
        userId_instanceId: {
          userId,
          instanceId
        }
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking instance access:', error);
    return NextResponse.json(
      { error: 'Failed to revoke instance access' },
      { status: 500 }
    );
  }
} 