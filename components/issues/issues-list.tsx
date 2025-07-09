// Issues List Component - 
"use client";

import { useState, useEffect, useMemo } from 'react';
import { IssueRow } from '@/components/issues/issue-row';
import { EmptyState } from '@/components/issues/empty-state';
import { LoadingState } from '@/components/issues/loading-state';
import { resourceHooks, useOfflineStatus } from '@/lib/hooks';

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
  const { isOffline, pendingCount } = useOfflineStatus();
  
  // Use the new DRY resource hooks
  const { data: issues = [], isLoading, error, refetch } = resourceHooks['issue'].useList();
  const { update: updateIssue } = resourceHooks['issue'].useUpdate();
  const { delete: deleteIssue } = resourceHooks['issue'].useDelete();

  // Filter issues locally based on current filters
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

  const handleIssueUpdate = async (updatedIssue: Issue) => {
    await updateIssue(updatedIssue.id, updatedIssue);
  };

  const handleIssueDelete = async (issueId: string) => {
    await deleteIssue(issueId);
  };

  // Show offline indicator if offline
  if (isOffline) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center text-sm text-amber-600">
          <div className="animate-pulse mr-2 h-4 w-4 bg-amber-500 rounded-full"></div>
          Offline ({pendingCount} pending actions)
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load issues: {error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredIssues.length === 0 && !isLoading) {
    return <EmptyState workspaceUrl={workspaceUrl} hasFilters={Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : Boolean(f))} />;
  }

  return (
    <div className="space-y-2">
      {/* Cache Status */}
      <div className="text-xs text-gray-500 px-2">
        Cache: ✅ Ready | 
        Issues: {issues.length} loaded | 
        {/* state.lastSync && ` Last sync: ${state.lastSync.toLocaleString()}` */}
      </div>

      {/* Online/Offline Status */}
      {/* {!state.isOnline && (
        <div className="text-sm text-yellow-600 px-2 py-1 bg-yellow-50 rounded">
          ⚠️ Offline - Changes will sync when reconnected
        </div>
      )} */}

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
      {isLoading && issues.length > 0 && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            Syncing...
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