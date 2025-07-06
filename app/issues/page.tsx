// Issues Page Redirect - Linear Clone
import { auth } from '@/lib/auth';
import { getUserLastAccessedWorkspace } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export default async function IssuesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const workspaceUrl = await getUserLastAccessedWorkspace(session.user.id);
  
  if (workspaceUrl) {
    redirect(`/workspace/${workspaceUrl}/issues`);
  } else {
    redirect('/workspace/create');
  }
} 