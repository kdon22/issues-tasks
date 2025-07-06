// Issues List Component - Linear Clone
"use client";

import { useState, useEffect, useMemo } from 'react';
import { IssueRow } from '@/components/issues/issue-row';
import { EmptyState } from '@/components/issues/empty-state';
import { LoadingState } from '@/components/issues/loading-state';
import { useApi } from '@/lib/hooks/use-api';

interface Issue {
  id: string;
  title: string;
  identifier: string;
  number: number;
  priority: 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name?: string;
    email: string;
  };
  assignee?: {
    id: string;
    name?: string;
    email: string;
  };
  team: {
    id: string;
    name: string;
    identifier: string;
  };
  project?: {
    id: string;
    name: string;
    identifier: string;
    color?: string;
  };
  state: {
    id: string;
    name: string;
    color: string;
    type: 'BACKLOG' | 'UNSTARTED' | 'STARTED' | 'COMPLETED' | 'CANCELED';
  };
  labels: Array<{
    id: string;
    issueId: string;
    labelId: string;
    label: {
      id: string;
      name: string;
      color: string;
      description?: string;
    };
  }>;
  _count: {
    comments: number;
    attachments: number;
  };
}

interface IssuesListProps {
  workspaceUrl: string;
  workspaceId: string;
  filters?: {
    search: string;
    status: string[];
    assignee: string[];
    project: string[];
    team: string[];
    issueType: string[];
  };
}

export function IssuesList({ 
  workspaceUrl, 
  workspaceId,
  filters = {
    search: '',
    status: [],
    assignee: [],
    project: [],
    team: [],
    issueType: []
  }
}: IssuesListProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  
  const { 
    data, 
    loading, 
    error, 
    get 
  } = useApi<{ data: Issue[]; meta: any }>(`/api/workspaces/${workspaceUrl}/issues`);

  // Fetch issues on mount and when filters change
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const params = new URLSearchParams();
        
        // Add filters to query params
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        filters.status.forEach(status => params.append('status', status));
        filters.assignee.forEach(assignee => params.append('assignee', assignee));
        filters.project.forEach(project => params.append('project', project));
        filters.team.forEach(team => params.append('team', team));
        filters.issueType.forEach(issueType => params.append('issueType', issueType));

        const url = `/api/workspaces/${workspaceUrl}/issues${params.toString() ? `?${params.toString()}` : ''}`;
        await get(url);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      }
    };

    fetchIssues();
  }, [workspaceUrl, filters, get]);

  // Update local issues when data changes
  useEffect(() => {
    if (data?.data) {
      setIssues(data.data);
    }
  }, [data]);

  // Filter issues locally based on current filters (backup/instant filtering)
  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchLower) ||
        issue.identifier.toLowerCase().includes(searchLower) ||
        issue.creator.name?.toLowerCase().includes(searchLower) ||
        issue.creator.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(issue => 
        filters.status.includes(issue.state.type)
      );
    }

    // Assignee filter
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(issue => 
        issue.assignee && filters.assignee.includes(issue.assignee.id)
      );
    }

    // Project filter
    if (filters.project.length > 0) {
      filtered = filtered.filter(issue => 
        issue.project && filters.project.includes(issue.project.id)
      );
    }

    // Team filter
    if (filters.team.length > 0) {
      filtered = filtered.filter(issue => 
        filters.team.includes(issue.team.id)
      );
    }

    return filtered;
  }, [issues, filters]);

  const handleIssueUpdate = (updatedIssue: Issue) => {
    setIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
  };

  const handleIssueDelete = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  if (loading && issues.length === 0) {
    return <LoadingState />;
  }

  if (error && issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load issues: {error}</p>
      </div>
    );
  }

  if (filteredIssues.length === 0 && !loading) {
    return <EmptyState workspaceUrl={workspaceUrl} hasFilters={Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : Boolean(f))} />;
  }

  return (
    <div className="space-y-2">
      {/* Issues List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {filteredIssues.map((issue, index) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            workspaceUrl={workspaceUrl}
            isLast={index === filteredIssues.length - 1}
            onUpdate={handleIssueUpdate}
            onDelete={handleIssueDelete}
          />
        ))}
      </div>

      {/* Loading indicator for filter changes */}
      {loading && issues.length > 0 && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            Updating...
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 px-1">
        {filteredIssues.length === 1 
          ? '1 issue' 
          : `${filteredIssues.length} issues`
        }
        {filteredIssues.length !== issues.length && 
          ` (filtered from ${issues.length})`
        }
      </div>
    </div>
  );
} 