"use client";

import { useState } from 'react';
import { IssuesList } from '@/components/issues/issues-list';
import { IssuesFilters } from '@/components/issues/issues-filters';

interface Team {
  id: string;
  name: string;
  identifier: string;
}

interface Project {
  id: string;
  name: string;
  identifier: string;
  color?: string;
}

interface IssueType {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

interface IssuesPageContentProps {
  workspaceUrl: string;
  workspaceId: string;
  teams: Team[];
  projects: Project[];
  issueTypes: IssueType[];
  members: Member[];
}

export function IssuesPageContent({
  workspaceUrl,
  workspaceId,
  teams,
  projects,
  issueTypes,
  members,
}: IssuesPageContentProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    assignee: [] as string[],
    project: [] as string[],
    team: [] as string[],
    issueType: [] as string[],
  });

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      <IssuesFilters 
        teams={teams}
        projects={projects}
        issueTypes={issueTypes}
        members={members}
        onFiltersChange={handleFiltersChange}
      />
      
      <IssuesList 
        workspaceUrl={workspaceUrl}
        workspaceId={workspaceId}
        filters={filters}
      />
    </div>
  );
} 