// Last Workspace API - Linear Clone
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserLastAccessedWorkspace } from '@/lib/auth-utils';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceUrl = await getUserLastAccessedWorkspace(session.user.id);
    
    return NextResponse.json({ workspaceUrl });
  } catch (error) {
    console.error('Error fetching last workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last workspace' },
      { status: 500 }
    );
  }
} 