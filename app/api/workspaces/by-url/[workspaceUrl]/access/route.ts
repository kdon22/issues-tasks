// Workspace Access Tracking API - Linear Clone
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateWorkspaceAccess } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{
    workspaceUrl: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceUrl } = await params;

    await updateWorkspaceAccess(session.user.id, workspaceUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking workspace access:', error);
    return NextResponse.json(
      { error: 'Failed to track workspace access' },
      { status: 500 }
    );
  }
} 