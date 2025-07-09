'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { resourceHooks } from '@/lib/hooks';
import { IssueDetailView } from '@/components/issues/issue-detail-view';
import { IssueDetailHeader } from '@/components/issues/issue-detail-header';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { useCurrentWorkspace } from '@/lib/hooks/use-current-workspace';
import { notFound } from 'next/navigation';

export default function IssueDetailPage() {
  const { workspaceUrl, issueId } = useParams();
  const { workspace } = useCurrentWorkspace();
  const { data: session } = useSession();
  
  // Use the new DRY resource hooks
  const { data: issue, isLoading: issueLoading, error: issueError } = resourceHooks['issue'].useGet(issueId as string);
  const { data: teams = [], isLoading: teamsLoading } = resourceHooks['team'].useList();
  const { data: projects = [], isLoading: projectsLoading } = resourceHooks['project'].useList();
  const { data: states = [], isLoading: statesLoading } = resourceHooks['state'].useList();
  const { data: issueTypes = [], isLoading: issueTypesLoading } = resourceHooks['issueType'].useList();
  const { data: members = [], isLoading: membersLoading } = resourceHooks['member'].useList();

  if (!session?.user?.id || !workspace) {
    return notFound();
  }

  if (issueError) {
    return (
      <AppShell 
        sidebar={<Sidebar />}
        header={<div className="h-16 bg-white border-b" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error loading issue</h2>
            <p className="text-gray-600">{issueError.message}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Show loading state while essential data is loading
  if (issueLoading || !issue) {
    return (
      <AppShell 
        sidebar={<Sidebar />}
        header={<div className="h-16 bg-white border-b" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issue...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Transform the data to match IssueDetailView interface
  const transformedIssue = {
    ...issue,
    team: teams.find((t: any) => t.id === issue.teamId) || issue.team,
    project: issue.projectId ? projects.find((p: any) => p.id === issue.projectId) : null,
    state: states.find((s: any) => s.id === issue.stateId) || issue.state,
    issueType: issueTypes.find((it: any) => it.id === issue.issueTypeId) || issue.issueType,
    labels: issue.labels || [],
    comments: issue.comments || [],
    attachments: issue.attachments || [],
    children: issue.children || [],
    activities: issue.activities || [],
    _count: {
      comments: issue.comments?.length || 0,
      attachments: issue.attachments?.length || 0,
      children: issue.children?.length || 0
    },
    fieldConfigurations: []
  };

  // Transform members to workspace members format
  const workspaceMembers = members.map((member: any) => ({
    id: member.user.id,
    user: member.user
  }));

  return (
    <AppShell 
      sidebar={<Sidebar />}
      header={
        <IssueDetailHeader 
          issue={transformedIssue as any}
          workspaceUrl={workspace.url}
        />
      }
    >
      <IssueDetailView 
        issue={transformedIssue as any}
        workspace={workspace}
        members={workspaceMembers}
        teams={teams as any}
        projects={projects as any}
        states={states as any}
        issueTypes={issueTypes as any}
        currentUserId={session.user.id}
      />
      

    </AppShell>
  );
} 