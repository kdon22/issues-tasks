'use client';

import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { resourceHooks } from '@/lib/hooks';
import { ProjectsPageContent } from '@/components/projects/projects-page-content';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { useCacheSystem } from '@/components/providers/cache-provider';

export default function ProjectOverviewPage() {
  const params = useParams();
  const { workspaceUrl, projectId } = params;
  const { data: session } = useSession();
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const { isInitialized: cacheInitialized } = useCacheSystem();

  // Use cached resource hooks for instant data access
  const { data: project, isLoading: projectLoading } = resourceHooks.project.useGet(projectId as string);
  const { data: issues = [], isLoading: issuesLoading } = resourceHooks.issue.useList();

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

  // Show loading while project data is loading
  if (projectLoading || !project) {
    return (
      <AppShell 
        sidebar={<Sidebar />}
        header={<AppHeader />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Check if project belongs to this workspace
  if (project.workspaceId !== workspace.id) {
    notFound();
  }

  // Filter issues for this project
  const projectIssues = issues.filter(issue => issue.projectId === projectId);

  return (
    <AppShell 
      sidebar={<Sidebar />}
      header={<AppHeader />}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recent Issues</h2>
              {projectIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No issues in this project yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {projectIssues.slice(0, 10).map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-muted-foreground">
                            {issue.identifier}
                          </span>
                          <span className="font-medium">{issue.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {issue.priority && (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                              {issue.priority}
                            </span>
                          )}
                          {issue.state && (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">
                              {issue.state.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Project Details</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Lead:</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {project.lead?.name || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Team:</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {project.team?.name || 'No team assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Issues:</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {projectIssues.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 