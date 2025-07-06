"use client";

import { useParams } from 'next/navigation';
import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
import { useResource } from '@/lib/hooks/use-resource';

// Icon options for issue types
const ISSUE_TYPE_ICONS = [
  { label: 'Bug 🐛', value: 'bug' },
  { label: 'Feature ✨', value: 'feature' },
  { label: 'Task 📋', value: 'task' },
  { label: 'Epic 🎯', value: 'epic' },
  { label: 'Story 📖', value: 'story' },
  { label: 'Improvement ⚡', value: 'improvement' },
  { label: 'Spike 🔍', value: 'spike' },
  { label: 'Subtask 📝', value: 'subtask' },
];

const ISSUE_TYPE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', 
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', 
  '#EC4899', '#F43F5E', '#6B7280', '#374151'
];

export default function WorkspaceIssueTypesPage() {
  const params = useParams();
  const workspaceUrl = params?.workspaceUrl as string;

  // Load status flows for dropdown
  const { items: statusFlows } = useResource({
    endpoint: `/api/workspaces/${workspaceUrl}/status-flows`,
    cacheKey: `workspace-${workspaceUrl}-status-flows`
  });

  return (
    <ResourceSettingsPage
      config={{
        endpoint: `/api/workspaces/${workspaceUrl}/issue-types`,
        resourceName: 'issue-types',
        title: 'Issue Types',
        description: 'Define different types of issues for your projects',
        maxWidth: '6xl',
        
        fields: [
          {
            key: 'icon',
            label: 'Icon',
            type: 'icon'
          },
          {
            key: 'name',
            label: 'Issue Type Name',
            type: 'text',
            required: true,
            placeholder: 'Enter issue type name'
          },
          {
            key: 'statusFlowId',
            label: 'Status Flow',
            type: 'select',
            required: true,
            options: statusFlows.map((flow: any) => ({
              label: flow.name,
              value: flow.id
            })),
            placeholder: 'Select a status flow'
          },
          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Describe this issue type'
          }
        ],
        
        searchFields: ['name', 'description'],
        sortField: 'name',
        
        actions: ['create', 'update', 'delete'],
        editableField: 'name', // Make name column clickable to edit
        
        useResourceHook: () => useResource({
          endpoint: `/api/workspaces/${workspaceUrl}/issue-types`,
          cacheKey: `workspace-${workspaceUrl}-issue-types`
        })
      }}
    />
  );
} 