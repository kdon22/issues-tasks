// Workspace Landing Page - Linear Clone
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';

interface WorkspacePageProps {
  params: Promise<{
    workspaceUrl: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { workspaceUrl } = await params;

  // Check if workspace exists and user has access
  const workspace = await prisma.workspace.findUnique({
    where: { url: workspaceUrl },
    include: {
      members: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  if (!workspace) {
    redirect('/workspace/create');
  }

  if (workspace.members.length === 0) {
    redirect('/workspace/create');
  }

  // Default redirect to issues page for now
  redirect(`/workspace/${workspaceUrl}/issues`);
} 