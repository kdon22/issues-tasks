'use client';

import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { resourceHooks } from '@/lib/hooks';
import { IssuesPageContent } from '@/components/issues/issues-page-content';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { LoadingState } from '@/components/issues/loading-state';
import { useCacheSystem } from '@/components/providers/cache-provider';

interface WorkspaceIssuesPageProps {
  params: Promise<{ workspaceUrl: string }>;
}

export default function WorkspaceIssuesPage() {
  const params = useParams();
  const { workspaceUrl } = params;
  const { data: session } = useSession();
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const { isInitialized: cacheInitialized } = useCacheSystem();

  // Use cached resource hooks for instant data access
  const { data: teams = [], isLoading: teamsLoading } = resourceHooks.team.useList();
  const { data: projects = [], isLoading: projectsLoading } = resourceHooks.project.useList();
  const { data: issueTypes = [], isLoading: issueTypesLoading } = resourceHooks.issueType.useList();
  const { data: members = [], isLoading: membersLoading } = resourceHooks.member.useList();

  // Check authentication
  if (!session?.user?.id) {
    window.location.href = '/auth/signin';
    return null;
  }

  // Check workspace access
  if (!workspaceLoading && !workspace) {
    notFound();
  }

  // Show loading while cache is initializing
  if (!cacheInitialized || workspaceLoading || !workspace) {
    return (
      <AppShell 
        sidebar={<Sidebar />}
        header={<AppHeader />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      sidebar={<Sidebar />}
      header={<AppHeader />}
    >
      <IssuesPageContent
        workspaceUrl={workspace.url}
        workspaceId={workspace.id}
        teams={teams}
        projects={projects.map(p => ({
          ...p,
          identifier: p.identifier || p.name.toLowerCase().replace(/\s+/g, '-'),
        }))}
        issueTypes={issueTypes}
        members={members}
      />
    </AppShell>
  );
} 