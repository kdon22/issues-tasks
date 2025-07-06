// Workspace Issues Page - Linear Clone
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { IssuesPageContent } from '@/components/issues/issues-page-content';

interface WorkspaceIssuesPageProps {
  params: Promise<{
    workspaceUrl: string;
  }>;
}

export default async function WorkspaceIssuesPage({ params }: WorkspaceIssuesPageProps) {
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

  // Fetch workspace data needed for filters
  const [teams, projects, issueTypes, members] = await Promise.all([
    prisma.team.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, identifier: true },
      orderBy: { name: 'asc' },
    }),
    prisma.project.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, identifier: true, color: true },
      orderBy: { name: 'asc' },
    }),
    prisma.issueType.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    }),
  ]);

  return (
    <AppShell sidebar={<Sidebar />}>
      <PageLayout 
        title="Issues"
        actions={
          <Button>
            Create Issue
          </Button>
        }
      >
        <IssuesPageContent 
          workspaceUrl={workspaceUrl}
          workspaceId={workspace.id}
          teams={teams}
          projects={projects}
          issueTypes={issueTypes}
          members={members.map(m => ({
            id: m.user.id,
            name: m.user.name || m.user.email,
            email: m.user.email,
          }))}
        />
      </PageLayout>
    </AppShell>
  );
} 